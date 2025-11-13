// src/app/comentarios/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowRight } from 'lucide-react';

import { useNotifications } from '@/hooks/useNotifications';
import { Contexto } from '@/components/validar/typesDados';
import type { Comment } from '@/services/notificationsService';
import { getContextos, getHistoricoContextos } from '@/services/contextoService';
import { authService } from '@/services/authService';

import { SearchBar } from '@/components/ui/search-bar';
import CommentItem from '@/components/notifications/commentItem';
import { useDebounce } from '@/hooks/useDebounce'; 
import { Button } from '@/components/button';

interface CommentContextItem {
    comment: Comment;
    contextoId: string;
    contextoNome: string; // Manter 'contextoNome' para UI
}

export default function MeusComentariosPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);

    const { notifications } = useNotifications();
    const [todosContextos, setTodosContextos] = useState<Contexto[]>([]);
    const currentUser = authService.getUser();

    useEffect(() => {
        let active = true;
        async function load() {
            try {
                const abertos = await getContextos();
                const historicoResp = await getHistoricoContextos(undefined, undefined, 1, 200);
                if (active) setTodosContextos([...(abertos || []), ...(historicoResp.data || [])]);
            } catch (e) {
                console.error('Falha ao carregar contextos para página de comentários', e);
            }
        }
        load();
        return () => { active = false; };
    }, []);

    const meusComentariosComContexto = useMemo((): CommentContextItem[] => {
        const comentariosFiltrados: CommentContextItem[] = [];
        notifications.forEach(n => {
            if (n.comments && n.comments.length) {
                n.comments.forEach((comment: Comment) => {
                    if (comment.isMyComment) {
                        const contextoEncontrado = todosContextos.find(c => n.title && c.title && n.title.toLowerCase().includes(c.title.toLowerCase()));
                        comentariosFiltrados.push({
                            comment,
                            contextoId: contextoEncontrado?.id || n.versaoId || String(comment.id),
                            contextoNome: contextoEncontrado?.title || n.title || 'Contexto',
                        });
                    }
                });
            }
        });
        try {
            comentariosFiltrados.sort((a, b) => {
                const dateTimeStringA = `${a.comment.date.split('/').reverse().join('-')}T${a.comment.time}`;
                const dateTimeStringB = `${b.comment.date.split('/').reverse().join('-')}T${b.comment.time}`;
                const dateA = new Date(dateTimeStringA);
                const dateB = new Date(dateTimeStringB);
                if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                    return dateB.getTime() - dateA.getTime();
                }
                return 0;
            });
        } catch (e) {
            console.error('Erro ao ordenar comentários', e);
        }
        return comentariosFiltrados;
    }, [notifications, todosContextos, currentUser?.id]);

    const comentariosFiltradosParaExibicao = useMemo(() => {
        if (!debouncedSearch) {
            return meusComentariosComContexto;
        }
        const lowerSearch = debouncedSearch.toLowerCase();
        return meusComentariosComContexto.filter(item =>
            item.comment.text.toLowerCase().includes(lowerSearch) ||
            item.contextoNome.toLowerCase().includes(lowerSearch) // Busca pelo nome (que agora vem de 'title')
        );
    }, [meusComentariosComContexto, debouncedSearch]);


    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Cabeçalho da Página */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#1745FF] mb-2 flex items-center gap-3">
                        <MessageSquare className="w-8 h-8" /> Meus Comentários
                    </h1>
                    <p className="text-gray-600">
                        Acompanhe aqui os comentários que você fez nos contextos.
                    </p>
                </div>

                {/* Barra de Busca */}
                <div className="mb-6">
                    <SearchBar
                        placeholder="Buscar por comentário ou nome do contexto..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                    />
                </div>

                {/* Lista de Comentários */}
                <div className="space-y-6">
                    {comentariosFiltradosParaExibicao.length > 0 ? (
                        comentariosFiltradosParaExibicao.map(({ comment, contextoId, contextoNome }) => (
                            <div key={`${contextoId}-${comment.id}`} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                {/* Informação do Contexto */}
                                <div className="mb-3 pb-3 border-b border-gray-100 flex justify-between items-center">
                                    <p className="text-sm text-gray-500">
                                        No contexto: <span className="font-semibold text-blue-600">{contextoNome}</span>
                                    </p>
                                    <Link href={`/validar?id=${contextoId}`} passHref> 
                                        <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 h-auto px-3 py-1 text-xs rounded-lg">
                                            Ver Contexto <ArrowRight className="ml-1 w-3 h-3" />
                                        </Button>
                                    </Link>
                                </div>
                                <CommentItem comment={comment} />
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 px-6 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500">
                                {searchQuery ? "Nenhum comentário encontrado para sua busca." : "Você ainda não fez nenhum comentário."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}