// src/components/navbar/navbar.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Loader2 } from 'lucide-react';
import NotificationsModal from "@/components/notifications/notificationsModal";
import { VisualizarContextoModal } from "@/components/popups/visualizarContextoModal";
import { ModalAdicionarConteudo } from "@/components/popups/addContextoModal/index";
import { getContextoById, criarVersao, getUltimaAtualizacaoContexto } from "@/services/contextoService";
import { Contexto } from "@/components/validar/typesDados";
import { Notification } from "@/constants/types";
import { SubmitData } from '@/components/popups/addContextoModal/types';
import UpdateStatusPopover from "./UpdateStatusPopover";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNotifications } from "@/hooks/useNotifications";
import { authService } from "@/services/authService";
import { showSuccessToast, showErrorToast } from "@/components/ui/Toasts";
import { mapTipoGraficoParaBackend, normalizarNumero } from "@/lib/gerenciaUtils";

type PartialContexto = Partial<Contexto> & { id: string };

type LastUpdateInfo = {
  relative: string;
  label: string;
  itemName: string | null;
  authorName: string | null;
  gerenciaName: string | null;
  gerenciaSlug: string | null;
  gerenciaId: string | null;
  contextoId: string | null;
  isRecent: boolean;
};

interface NavbarProps {
  onOpenSidebar: () => void;
}

export default function Navbar({ onOpenSidebar }: NavbarProps) {
  const router = useRouter();
  const [lastUpdateInfo, setLastUpdateInfo] = useState<LastUpdateInfo>({
    relative: "",
    label: "",
    itemName: null,
    authorName: null,
    gerenciaName: null,
    gerenciaSlug: null,
    gerenciaId: null,
    contextoId: null,
    isRecent: false
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDetalhesContextoOpen, setIsDetalhesContextoOpen] = useState(false);
  const [isValidationMode, setIsValidationMode] = useState(false);
  const [selectedContexto, setSelectedContexto] = useState<Contexto | PartialContexto | null>(null);
  const [isLoadingContexto, setIsLoadingContexto] = useState(false);

  // Estados para Correção (Membro)
  const [isCorrecaoModalOpen, setIsCorrecaoModalOpen] = useState(false);
  const [contextoParaCorrecao, setContextoParaCorrecao] = useState<Contexto | null>(null);

  const userProfile = useCurrentUser();

  const {
    notifications,
    isLoading: isLoadingNotifications,
    isError: isErrorNotifications,
    readNotifications, 
    markAsRead, 
  } = useNotifications(userProfile?.name);

  const totalUnreadCount = useMemo(() => {
    if (!notifications) return 0;
    const lidas = readNotifications || [];
    return notifications.filter(n => !lidas.includes(n.id)).length;
  }, [notifications, readNotifications]);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (!Number.isFinite(diffMs) || diffMs < 0) return "agora";

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day;
    const year = 12 * month;

    if (diffMs < minute) return "agora mesmo";
    if (diffMs < hour) {
      const minutes = Math.floor(diffMs / minute);
      return minutes === 1 ? "há 1 minuto" : `há ${minutes} minutos`;
    }
    if (diffMs < day) {
      const hours = Math.floor(diffMs / hour);
      return hours === 1 ? "há 1 hora" : `há ${hours} horas`;
    }
    if (diffMs < month) {
      const days = Math.floor(diffMs / day);
      return days === 1 ? "há 1 dia" : `há ${days} dias`;
    }
    if (diffMs < year) {
      const months = Math.floor(diffMs / month);
      return months === 1 ? "há 1 mês" : `há ${months} meses`;
    }
    const years = Math.floor(diffMs / year);
    return years === 1 ? "há 1 ano" : `há ${years} anos`;
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getUltimaAtualizacaoContexto();
        if (!active) return;

        if (!data || !data.updatedAt) {
          setLastUpdateInfo({
            relative: "",
            label: "",
            itemName: null,
            authorName: null,
            gerenciaName: null,
            gerenciaSlug: null,
            gerenciaId: null,
            contextoId: null,
            isRecent: false
          });
          return;
        }

        const updatedAt = new Date(data.updatedAt);
        if (Number.isNaN(updatedAt.getTime())) {
          setLastUpdateInfo({
            relative: "",
            label: "",
            itemName: null,
            authorName: null,
            gerenciaName: null,
            gerenciaSlug: null,
            gerenciaId: null,
            contextoId: null,
            isRecent: false
          });
          return;
        }

        const relative = formatRelativeTime(updatedAt);
        const label = updatedAt.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        const itemName = data.tituloVersao || data.tituloContexto || null;
        const diffDays = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);

        setLastUpdateInfo({
          relative,
          label,
          itemName,
          authorName: data.autorNome || null,
          gerenciaName: data.gerenciaNome || null,
          gerenciaSlug: data.gerenciaSlug || null,
          gerenciaId: data.gerenciaId || null,
          contextoId: data.contextoId || null,
          isRecent: diffDays <= 7
        });
      } catch (error) {
        console.error('Erro ao carregar última atualização:', error);
        if (active) {
          setLastUpdateInfo({
            relative: "",
            label: "",
            itemName: null,
            authorName: null,
            gerenciaName: null,
            gerenciaSlug: null,
            gerenciaId: null,
            contextoId: null,
            isRecent: false
          });
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleLastUpdateClick = () => {
    const target = lastUpdateInfo.gerenciaSlug || lastUpdateInfo.gerenciaId;
    if (!target) return;
    router.push(`/gerencia/${target}`);
  };

  // --- HANDLERS ---
  
  const handleDeferir = async (versaoId: string, comentario?: string) => {
    const role = userProfile?.role;
    let endpoint = "";
    if (role === 'gerente') endpoint = `${apiBase}/contextos/versoes/${versaoId}/gerente-aprovar`;
    else if (role === 'diretor') endpoint = `${apiBase}/contextos/versoes/${versaoId}/diretor-publicar`;
    else return;

    try {
        const token = authService.getToken();
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ comentario })
        });
        if (!res.ok) throw new Error("Falha ao deferir");
        showSuccessToast("Sucesso", "Ação realizada com sucesso!");
        setIsDetalhesContextoOpen(false);
        router.refresh(); 
    } catch (e) { console.error(e); showErrorToast("Erro", "Não foi possível realizar a ação."); }
  };

  const handleIndeferir = async (versaoId: string, justificativa: string) => {
     try {
        const token = authService.getToken();
        const res = await fetch(`${apiBase}/contextos/versoes/${versaoId}/diretor-indeferir`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ justificativa })
        });
        if (!res.ok) throw new Error("Falha ao indeferir");
        showSuccessToast("Sucesso", "Contexto indeferido.");
        setIsDetalhesContextoOpen(false);
        router.refresh();
     } catch (e) { console.error(e); showErrorToast("Erro", "Não foi possível indeferir."); }
  };

  const handleCorrigir = async (versaoId: string, justificativa: string) => {
     try {
        const token = authService.getToken();
        const res = await fetch(`${apiBase}/contextos/versoes/${versaoId}/solicitar-correcao`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ justificativa })
        });
        if (!res.ok) throw new Error("Falha ao solicitar correção");
        showSuccessToast("Sucesso", "Correção solicitada.");
        setIsDetalhesContextoOpen(false);
        router.refresh();
     } catch (e) { console.error(e); showErrorToast("Erro", "Não foi possível solicitar correção."); }
  };

  // Lógica de Abrir e Salvar Correção (Membro)
  const handleAbrirCorrecao = (contexto: Contexto) => {
      setIsDetalhesContextoOpen(false);
      setContextoParaCorrecao(contexto);
      setTimeout(() => setIsCorrecaoModalOpen(true), 50);
  };

  // [CORREÇÃO]: Lógica de extração robusta baseada no tipo de envio
  const handleSalvarNovaVersao = async (dados: SubmitData) => {
      if (!contextoParaCorrecao) return;

      try {
          let payload: any = {};
          let file: File | null = null;

          // Lógica adaptada do GerenciaPage para extrair corretamente de dados.payload
          if (dados.type === 'contexto') {
              payload = {
                  titulo: dados.payload.title?.trim(),
                  descricao: dados.payload.details?.trim(),
                  tipo: 'ARQUIVO_LINK',
                  linkUrl: dados.payload.url?.trim(),
                  motivoNovaVersao: "Correção solicitada"
              };
              file = dados.payload.file ?? null;

          } else if (dados.type === 'dashboard') {
              payload = {
                  titulo: dados.payload.title?.trim(),
                  descricao: dados.payload.details?.trim(),
                  tipo: 'DASHBOARD',
                  tipoGrafico: mapTipoGraficoParaBackend(dados.payload.type),
                  dashboardPayload: dados.payload.dataset
                      ? JSON.parse(JSON.stringify(dados.payload.dataset))
                      : undefined,
                  motivoNovaVersao: "Correção solicitada"
              };

          } else if (dados.type === 'indicador') {
              payload = {
                  titulo: dados.payload.titulo?.trim(),
                  descricao: dados.payload.descricao?.trim(),
                  tipo: 'INDICADOR',
                  valorAtual: normalizarNumero(dados.payload.valorAtual),
                  valorAlvo: normalizarNumero(dados.payload.valorAlvo),
                  unidade: dados.payload.unidade,
                  textoComparativo: dados.payload.textoComparativo,
                  cor: dados.payload.cor,
                  icone: dados.payload.icone,
                  motivoNovaVersao: "Correção solicitada"
              };
          }

          // Envia para o serviço
          await criarVersao(contextoParaCorrecao.id, payload, file);
          
          showSuccessToast("Sucesso", "Nova versão enviada para análise.");
          setIsCorrecaoModalOpen(false);
          setContextoParaCorrecao(null);
          router.refresh();

      } catch (error) { 
          console.error(error); 
          showErrorToast("Erro", "Falha ao enviar correção."); 
      }
  };

  const handleOpenContextoDetails = async (notification: Notification) => {
    if (!notification.contextoId) return;
    const shouldValidate = (notification as any).isValidationAction === true;
    setIsValidationMode(shouldValidate);
    setIsLoadingContexto(true);
    setIsNotificationsOpen(false);
    handleMarkAsRead(notification.id);

    try {
      const contextoDetails = await getContextoById(notification.contextoId);
      if (contextoDetails) {
        setSelectedContexto(contextoDetails);
        setIsDetalhesContextoOpen(true);
      } else {
        console.warn(`Contexto não encontrado.`);
        setSelectedContexto({ id: notification.contextoId }); 
        setIsDetalhesContextoOpen(true);
      }
    } catch (error) { console.error(error); showErrorToast("Erro", "Erro ao carregar detalhes."); setIsNotificationsOpen(true); } 
    finally { setIsLoadingContexto(false); }
  };

  const handleCloseDetalhesContexto = () => {
    setIsDetalhesContextoOpen(false);
    setSelectedContexto(null);
    setIsValidationMode(false);
  };

  const handleMarkAsRead = (id: number | "all") => markAsRead(id === "all" ? notifications.map(n => n.id) : [id]);
  const handleNotificationsClick = () => setIsNotificationsOpen(true);
  const handleCloseNotifications = () => setIsNotificationsOpen(false);

  return (
    <>
      <header className="bg-white w-full drop-shadow-md sticky top-0 z-35">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <button onClick={onOpenSidebar} className="text-blue-700 hover:text-blue-500 transition-colors p-2 -ml-2 md:ml-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"> <Menu strokeWidth={2.5} className="w-6 h-6 md:w-7 md:h-7" /> </button>
          <div className="flex items-center gap-4 md:gap-6 lg:gap-8"> <Link href="/" className="block flex-shrink-0"> <h1 className="text-xl md:text-2xl text-blue-700 hover:text-blue-500 transition-colors"> Vigia<b>SUS</b> </h1> </Link> <Image src="/logos/logo-jaboatao.png" alt="Prefeitura de Jaboatão" width={150} height={30} className="h-7 md:h-8 w-auto hidden sm:block" priority /> </div>
          <div className="flex items-center gap-3 md:gap-4 text-blue-700">
            <UpdateStatusPopover
              lastUpdateRelative={lastUpdateInfo.relative}
              lastUpdateLabel={lastUpdateInfo.label}
              lastUpdateItemName={lastUpdateInfo.itemName}
              isRecent={lastUpdateInfo.isRecent}
              authorName={lastUpdateInfo.authorName}
              gerenciaName={lastUpdateInfo.gerenciaName}
              onContextClick={lastUpdateInfo.gerenciaSlug || lastUpdateInfo.gerenciaId ? handleLastUpdateClick : undefined}
            />
            <div className="relative">
              <button onClick={handleNotificationsClick} className="hover:opacity-70 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1">
                <Image src="/icons/sininho.svg" alt="" width={24} height={24} className="w-6 h-6" />
              </button>
              {totalUnreadCount > 0 && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white text-white text-[10px] flex items-center justify-center font-bold pointer-events-none">
                  {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <NotificationsModal isOpen={isNotificationsOpen} onClose={handleCloseNotifications} onOpenContextoDetails={handleOpenContextoDetails} notifications={notifications} isLoading={isLoadingNotifications} isError={isErrorNotifications} readNotifications={readNotifications || []} onMarkAsRead={handleMarkAsRead} />

      <VisualizarContextoModal
        estaAberto={isDetalhesContextoOpen}
        aoFechar={handleCloseDetalhesContexto}
        dadosDoContexto={selectedContexto}
        perfil={userProfile?.role ?? 'membro'}
        
        isFromHistory={false} 
        isValidation={isValidationMode}
        
        // Se não estiver em validação (Membro), passa o handler de correção
        aoCriarNovaVersao={!isValidationMode ? handleAbrirCorrecao : undefined}
        
        onDeferir={handleDeferir}
        onIndeferir={handleIndeferir}
        onCorrigir={handleCorrigir}
        
        usuarioGerenciaId={userProfile?.gerenciaId}
      />

      {/* Modal de Correção (Upload de nova versão) */}
      <ModalAdicionarConteudo
        estaAberto={isCorrecaoModalOpen}
        aoFechar={() => { setIsCorrecaoModalOpen(false); setContextoParaCorrecao(null); }}
        aoSubmeter={handleSalvarNovaVersao}
        abaInicial={contextoParaCorrecao?.type === 'dashboard' ? 'dashboard' : contextoParaCorrecao?.type === 'indicador' ? 'indicador' : 'contexto'}
        // [CORREÇÃO]: Passamos as props corretas para o Modal (Partial<Contexto>)
        // Usamos 'title' e 'description' que são as chaves de Contexto, não 'titulo'
        dadosIniciais={contextoParaCorrecao ? {
             ...contextoParaCorrecao, // Espalha propriedades compatíveis
             // Garante que payload do dashboard esteja disponível se necessário
             payload: contextoParaCorrecao.payload
        } : undefined}
        isEditing={true}
      />

      {isLoadingContexto && ( <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center"> <Loader2 className="h-10 w-10 animate-spin text-blue-600" /> </div> )}
    </>
  );
}