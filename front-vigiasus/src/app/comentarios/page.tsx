// src/app/comentarios/page.tsx
"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowRight } from 'lucide-react';

// Importar tipos e dados mockados
import { notificationsData } from '@/constants/notificationsData';
import { mockData as contextosAbertos } from '@/constants/contextos';
import { mockDataHistorico as contextosHistorico } from '@/constants/contextosHistorico';
import { Comment, Contexto } from '@/components/validar/typesDados'; // Usar tipos de validar

import { SearchBar } from '@/components/ui/search-bar';
import CommentItem from '@/components/notifications/commentItem'; // Reutilizar o item de comentário
import { useDebounce } from '@/hooks/useDebounce'; // Para otimizar a busca
import { Button } from '@/components/button';

// Interface para agrupar comentário e informações do contexto
interface CommentContextItem {
    comment: Comment;
    contextoId: string;
    contextoNome: string;
    // Poderíamos adicionar a data/hora do *contexto* se necessário
}

export default function MeusComentariosPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Simula a busca de comentários do usuário e dados do contexto associado
    const meusComentariosComContexto = useMemo((): CommentContextItem[] => {
        const comentariosFiltrados: CommentContextItem[] = [];
        const todosContextos = [...contextosAbertos, ...contextosHistorico]; // Combina mocks

        notificationsData.forEach(notificacao => {
            if (notificacao.contextoId && notificacao.comments) {
                notificacao.comments.forEach(comment => {
                    // **Simulação:** Considera comentários onde o autor é "Você"
                    // Em um sistema real, isso seria filtrado pelo ID do usuário no backend
                    if (comment.author === "Você") {
                        // Busca o nome do contexto associado
                        const contexto = todosContextos.find(ctx => ctx.id === notificacao.contextoId);
                        if (contexto) {
                            comentariosFiltrados.push({
                                comment: comment,
                                contextoId: contexto.id,
                                contextoNome: contexto.nome,
                            });
                        }
                    }
                });
            }
        });

        // Ordena os comentários do mais recente para o mais antigo (baseado na data/hora do comentário)
        try {
            comentariosFiltrados.sort((a, b) => {
                const dateTimeStringA = `${a.comment.date.split('/').reverse().join('-')}T${a.comment.time}`;
                const dateTimeStringB = `${b.comment.date.split('/').reverse().join('-')}T${b.comment.time}`;
                const dateA = new Date(dateTimeStringA);
                const dateB = new Date(dateTimeStringB);
                if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                    return dateB.getTime() - dateA.getTime(); // Mais recente primeiro
                }
                return 0;
            });
        } catch (e) {
             console.error("Erro ao ordenar comentários:", e, comentariosFiltrados);
        }


        return comentariosFiltrados;
    }, []); // Executa apenas uma vez, pois os mocks não mudam

    // Filtra os comentários com base na busca
    const comentariosFiltradosParaExibicao = useMemo(() => {
        if (!debouncedSearch) {
            return meusComentariosComContexto;
        }
        const lowerSearch = debouncedSearch.toLowerCase();
        return meusComentariosComContexto.filter(item =>
            item.comment.text.toLowerCase().includes(lowerSearch) ||
            item.contextoNome.toLowerCase().includes(lowerSearch)
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
                                    {/* Link para o contexto (ajuste a rota se necessário) */}
                                    <Link href={`/validar?id=${contextoId}`} passHref> {/* Exemplo de link */}
                                        <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 h-auto px-3 py-1 text-xs rounded-lg">
                                            Ver Contexto <ArrowRight className="ml-1 w-3 h-3" />
                                        </Button>
                                    </Link>
                                </div>
                                {/* Item do Comentário */}
                                {/* Passando um objeto Comment completo para CommentItem */}
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