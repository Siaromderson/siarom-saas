"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Wifi, WifiOff, QrCode, RefreshCw, CheckCircle2 } from "lucide-react";
import {
  gerarQrcode,
  verificarConexao,
} from "@/app/crm/configuracoes/actions";
import type { Empresa } from "@/lib/empresaContext";

export function WhatsappConnect({ empresa }: { empresa: Empresa }) {
  const [conectado, setConectado] = useState<boolean>(
    empresa.uazapi_status === "conectado"
  );
  const [qrcode, setQrcode] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [gerando, startGerar] = useTransition();
  const [verificando, startVerify] = useTransition();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pararPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  function gerar() {
    setErro(null);
    setQrcode(null);
    startGerar(async () => {
      const res = await gerarQrcode();
      if (res.error) setErro(res.error);
      else if (res.conectado) {
        setConectado(true);
        setQrcode(null);
      } else if (res.qrcode) {
        setQrcode(res.qrcode);
      }
    });
  }

  const verificar = useCallback(
    (silencioso = false) => {
      startVerify(async () => {
        const res = await verificarConexao();
        if (res.error) {
          if (!silencioso) setErro(res.error);
          return;
        }
        if (res.conectado) {
          setConectado(true);
          setQrcode(null);
          pararPoll();
        } else if (!silencioso) {
          setErro("Ainda não conectado. Escaneie o QR Code e tente de novo.");
        }
      });
    },
    [pararPoll]
  );

  // Enquanto o QR está na tela e não conectou, verifica a conexão a cada 4s.
  useEffect(() => {
    if (qrcode && !conectado) {
      pollRef.current = setInterval(() => verificar(true), 4000);
      return pararPoll;
    }
  }, [qrcode, conectado, verificar, pararPoll]);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-slate-900">Conexão WhatsApp</h2>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            conectado ? "bg-accent-500/15 text-accent-600" : "bg-red-50 text-red-700"
          }`}
        >
          {conectado ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {conectado ? "Conectado" : "Desconectado"}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Gere o QR Code e escaneie no seu WhatsApp para a Alice começar a atender.
      </p>

      {conectado ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-accent-200/60 bg-accent-500/5 p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-accent-500" />
          <p className="font-display text-lg font-bold text-slate-900">
            WhatsApp conectado!
          </p>
          <p className="text-sm text-slate-500">
            A Alice já está atendendo. Você pode reconectar se trocar de aparelho.
          </p>
          <button onClick={gerar} disabled={gerando} className="btn-glass mt-1">
            {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
            Reconectar
          </button>
        </div>
      ) : qrcode ? (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="glass rounded-2xl p-4">
            {/* QR vem como data URL da UAZAPI */}
            <Image
              src={qrcode}
              alt="QR Code do WhatsApp"
              width={240}
              height={240}
              unoptimized
              className="h-60 w-60 rounded-lg"
            />
          </div>
          <ol className="max-w-sm space-y-1 text-sm text-slate-500">
            <li>1. Abra o <strong>WhatsApp</strong> no celular.</li>
            <li>2. Toque em <strong>Aparelhos conectados → Conectar aparelho</strong>.</li>
            <li>3. Aponte a câmera para este QR Code.</li>
          </ol>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => verificar(false)} disabled={verificando} className="btn-primary">
              {verificando ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Já escaneei
            </button>
            <button onClick={gerar} disabled={gerando} className="btn-glass">
              {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Gerar novo QR
            </button>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <Loader2 className="h-3 w-3 animate-spin" /> Verificando a conexão automaticamente…
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-white/50 bg-white/40 p-8 text-center">
          <QrCode className="h-12 w-12 text-brand-500" />
          <p className="text-sm text-slate-500">
            Clique abaixo para gerar o QR Code de conexão.
          </p>
          <button onClick={gerar} disabled={gerando} className="btn-primary">
            {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
            Gerar QR Code
          </button>
        </div>
      )}

      {erro && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {erro}
        </p>
      )}
    </div>
  );
}
