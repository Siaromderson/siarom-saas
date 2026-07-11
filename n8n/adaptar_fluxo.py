#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Adapta o fluxo "AGENTE IA SIAROM SAAS" para integrar com o Chat interativo do CRM.

O que ele faz (sem mexer na lógica da IA):
  1) Insere um nó "Buscar empresa" (Postgres) logo após o Webhook, que resolve o
     empresa_id via empresas.uazapi_token = token da instância (vem no webhook).
     Passa o empresa_id adiante pelo nó "Variáveis Globais".
  2) Espelha cada mensagem na tabela public.mensagens:
       - ENTRADA: após "Setar Agente" (texto já consolidado, inclui transcrição de mídia)
       - SAÍDA:   após "respostaInteresse1" (resposta da IA)
     Ambos com onError=continue → nunca quebram o fluxo.
  3) Converte TODOS os nós n8n-nodes-base.supabase em n8n-nodes-base.postgres,
     usando a credencial Postgres "Supabase - SIAROM SAAS".
  4) Adiciona empresa_id ao insert "Criar o lead na tabela" (leads passam a ser
     escopados por empresa e aparecem no CRM).

Uso:
    python3 adaptar_fluxo.py original.json adaptado.json
"""

import json
import sys

# Credencial Postgres já existente no fluxo (Postgres Chat Memory usa ela).
PG_CRED = {"postgres": {"id": "SVxiZJZf7M7dSVKD", "name": "Supabase - SIAROM SAAS"}}

RL_PUBLIC = {"__rl": True, "mode": "list", "value": "public"}


def rl_table(name):
    return {"__rl": True, "mode": "list", "value": name, "cachedResultName": name}


def convert_supabase_node(node):
    """Converte um nó supabase em postgres, preservando id/nome/posição/flags."""
    p = node.get("parameters", {})
    op = p.get("operation") or "create"  # supabase: sem operation = create (insert)
    table = p.get("tableId", "")

    if not table:
        # Nó sem tabela (ex.: "Get a row" quebrado) — não converte, só avisa.
        print(f"  ! pulei (sem tableId): {node.get('name')}")
        return node

    newp = {"schema": dict(RL_PUBLIC), "table": rl_table(table), "options": {}}

    if op == "get":
        newp["operation"] = "select"
        newp["returnAll"] = True
        vals = []
        for c in p.get("filters", {}).get("conditions", []):
            col = c.get("keyName")
            if not col:
                continue
            vals.append({"column": col, "condition": "equals", "value": c.get("keyValue")})
        newp["where"] = {"values": vals}

    elif op == "create":
        newp["operation"] = "insert"
        value = {f["fieldId"]: f["fieldValue"] for f in p.get("fieldsUi", {}).get("fieldValues", [])}
        newp["columns"] = {
            "mappingMode": "defineBelow",
            "value": value,
            "matchingColumns": [],
            "attemptToConvertTypes": False,
            "convertFieldsToString": True,
        }

    elif op == "update":
        newp["operation"] = "update"
        conds = p.get("filters", {}).get("conditions", [])
        key = conds[0].get("keyName") if conds else None
        value = {}
        if key:
            value[key] = conds[0].get("keyValue")
        for f in p.get("fieldsUi", {}).get("fieldValues", []):
            value[f["fieldId"]] = f["fieldValue"]
        newp["columns"] = {
            "mappingMode": "defineBelow",
            "matchingColumns": [key] if key else [],
            "value": value,
            "attemptToConvertTypes": False,
            "convertFieldsToString": True,
        }

    elif op == "delete":
        newp["operation"] = "deleteTable"
        newp["deleteCommand"] = "delete"
        vals = []
        for c in p.get("filters", {}).get("conditions", []):
            col = c.get("keyName")
            if not col:
                continue
            vals.append({"column": col, "value": c.get("keyValue")})
        newp["where"] = {"values": vals}

    else:
        print(f"  ! operação desconhecida '{op}' em {node.get('name')} — mantida supabase")
        return node

    node["parameters"] = newp
    node["type"] = "n8n-nodes-base.postgres"
    node["typeVersion"] = 2.6
    node["credentials"] = dict(PG_CRED)
    return node


def pg_insert_mensagens(node_id, name, position, value):
    return {
        "parameters": {
            "schema": dict(RL_PUBLIC),
            "table": rl_table("mensagens"),
            "columns": {
                "mappingMode": "defineBelow",
                "value": value,
                "matchingColumns": [],
                "attemptToConvertTypes": False,
                "convertFieldsToString": True,
            },
            "options": {},
        },
        "type": "n8n-nodes-base.postgres",
        "typeVersion": 2.6,
        "position": position,
        "id": node_id,
        "name": name,
        "credentials": dict(PG_CRED),
        "onError": "continueRegularOutput",
    }


def main():
    src, dst = sys.argv[1], sys.argv[2]
    with open(src, "r", encoding="utf-8") as f:
        flow = json.load(f)

    nodes = flow["nodes"]
    conns = flow["connections"]

    # Nome real (possivelmente com acentos "quebrados") do nó Variáveis Globais:
    # pegamos do destino atual do Webhook para não depender do encoding.
    var_globais = conns["Webhook"]["main"][0][0]["node"]
    print(f"Nó de variáveis globais detectado: {var_globais!r}")

    # ---- 1) Nó Buscar empresa (Postgres select empresas por uazapi_token) ----
    buscar_empresa = {
        "parameters": {
            "operation": "select",
            "schema": dict(RL_PUBLIC),
            "table": rl_table("empresas"),
            "returnAll": True,
            "where": {
                "values": [
                    {
                        "column": "uazapi_token",
                        "condition": "equals",
                        "value": "={{ $('Webhook').first().json.body.token }}",
                    }
                ]
            },
            "options": {},
        },
        "type": "n8n-nodes-base.postgres",
        "typeVersion": 2.6,
        "position": [1792, 560],
        "id": "e11a0000-0000-4000-a000-000000000001",
        "name": "Buscar empresa",
        "credentials": dict(PG_CRED),
        "alwaysOutputData": True,
        "onError": "continueRegularOutput",
    }
    nodes.append(buscar_empresa)

    # Rewire: Webhook -> Buscar empresa -> (Variáveis Globais)
    conns["Webhook"]["main"][0] = [{"node": "Buscar empresa", "type": "main", "index": 0}]
    conns["Buscar empresa"] = {"main": [[{"node": var_globais, "type": "main", "index": 0}]]}

    # No nó Variáveis Globais: (a) trocar $json.body -> $('Webhook').first().json.body
    # (porque agora o item de entrada é a empresa, não o webhook) e (b) adicionar empresa_id.
    for n in nodes:
        if n.get("name") == var_globais:
            raw = json.dumps(n, ensure_ascii=False)
            raw = raw.replace("$json.body", "$('Webhook').first().json.body")
            n2 = json.loads(raw)
            n2["parameters"]["assignments"]["assignments"].append(
                {
                    "id": "empresa-id-0001",
                    "name": "empresa_id",
                    "value": "={{ $('Buscar empresa').first().json.id }}",
                    "type": "string",
                }
            )
            n.clear()
            n.update(n2)
            break

    # ---- 3) Converter todos os nós supabase em postgres ----
    print("Convertendo nós supabase -> postgres:")
    for n in nodes:
        if n.get("type") == "n8n-nodes-base.supabase":
            print(f"  - {n.get('name')} ({n.get('parameters', {}).get('operation') or 'create'})")
            convert_supabase_node(n)

    # ---- 4) empresa_id no insert "Criar o lead na tabela" ----
    for n in nodes:
        if n.get("name") == "Criar o lead na tabela":
            n["parameters"].setdefault("columns", {}).setdefault("value", {})
            n["parameters"]["columns"]["value"]["empresa_id"] = (
                f"={{{{ $('{var_globais}').first().json.empresa_id }}}}"
            )

    # ---- 2) Nós de espelhamento no CRM (entrada/saída) ----
    entrada = pg_insert_mensagens(
        "c1a70000-0000-4000-a000-000000000002",
        "Registrar entrada no CRM",
        [6928, 720],
        {
            "empresa_id": f"={{{{ $('{var_globais}').first().json.empresa_id }}}}",
            "chat_id": "={{ $('Busca o Lead atualizado').first().json.id }}",
            "direcao": "entrada",
            "tipo": "texto",
            "conteudo": "={{ $('Setar Agente').first().json.mensagem }}",
            "remetente": "contato",
            "status": "recebida",
        },
    )
    saida = pg_insert_mensagens(
        "c1a70000-0000-4000-a000-000000000003",
        "Registrar saída no CRM",
        [11104, 680],
        {
            "empresa_id": f"={{{{ $('{var_globais}').first().json.empresa_id }}}}",
            "chat_id": "={{ $('Busca o Lead atualizado').first().json.id }}",
            "direcao": "saida",
            "tipo": "texto",
            "conteudo": "={{ $('respostaInteresse1').first().json.resposta }}",
            "remetente": "alice",
            "status": "enviada",
        },
    )
    nodes.extend([entrada, saida])

    # Ligações extras (adiciona destino sem remover os existentes)
    conns.setdefault("Setar Agente", {}).setdefault("main", [[]])
    conns["Setar Agente"]["main"][0].append(
        {"node": "Registrar entrada no CRM", "type": "main", "index": 0}
    )
    conns.setdefault("respostaInteresse1", {}).setdefault("main", [[]])
    conns["respostaInteresse1"]["main"][0].append(
        {"node": "Registrar saída no CRM", "type": "main", "index": 0}
    )

    with open(dst, "w", encoding="utf-8") as f:
        json.dump(flow, f, ensure_ascii=False, indent=2)

    print(f"\nOK → {dst}")


if __name__ == "__main__":
    main()
