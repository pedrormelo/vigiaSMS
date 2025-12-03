// src/app/admin/usuarios/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { getUsuarios, excluirUsuario, type Usuario } from "@/services/usuarioService";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, ShieldCheck } from "lucide-react";
import UserModal from "@/components/admin/userModal";
import { showSuccessToast, showErrorToast } from "@/components/ui/Toasts";
import ConfirmDeleteModal from "@/components/admin/confirmeDeleteModal";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { authService } from "@/services/authService";

export default function AdminUsuariosPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Obter o ID do usuário logado para impedir auto-edição/exclusão
    const currentUser = useCurrentUser();
    // Fallback para authService caso o hook não tenha o ID exposto diretamente na tipagem atual
    const loggedUserId = (currentUser as any)?.id || authService.getUser()?.id;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<Usuario | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);

    const carregarUsuarios = async () => {
        setIsLoading(true);
        try {
            const data = await getUsuarios();
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            showErrorToast("Erro ao carregar usuários.");
            setUsuarios([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        carregarUsuarios();
    }, []);

    const handleRequestDelete = (user: Usuario) => {
        if (user.id === loggedUserId) return; // Proteção extra
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async (password: string) => {
        if (!userToDelete) return;
        try {
            await excluirUsuario(userToDelete.id, password);
            showSuccessToast("Usuário excluído com sucesso.");
            await carregarUsuarios();
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        } catch (e: any) {
            // Erro tratado no modal ou toast
        }
    };

    const handleEdit = (user: Usuario) => {
        if (user.id === loggedUserId) return; // Proteção extra
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setUserToEdit(null);
        setIsModalOpen(true);
    };

    const filteredUsers = useMemo(() => {
        if (!usuarios || !Array.isArray(usuarios)) return [];
        const term = search.toLowerCase();
        return usuarios.filter(u => {
            const nome = (u.nome || "").toLowerCase();
            const cpf = (u.cpf || "");
            const role = (u.role || "").toLowerCase();
            return nome.includes(term) || cpf.includes(term) || role.includes(term);
        });
    }, [usuarios, search]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                            <ShieldCheck className="text-blue-600" /> Gestão de Usuários
                        </h1>
                        <p className="text-gray-500">Gerencie acessos, perfis e alocações do sistema.</p>
                    </div>
                    <Button onClick={handleNew} className="bg-blue-600 text-white hover:bg-blue-700 gap-2 rounded-xl">
                        <Plus size={18} /> Novo Usuário
                    </Button>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Buscar por nome, CPF ou perfil..." 
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Nome / CPF</th>
                                <th className="px-6 py-4 font-semibold">Perfil</th>
                                <th className="px-6 py-4 font-semibold">Alocação</th>
                                <th className="px-6 py-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map(user => {
                                const isSelf = user.id === loggedUserId;
                                
                                return (
                                    <tr key={user.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <p className="font-medium text-gray-900 flex items-center gap-2">
                                                        {user.nome || "Sem Nome"}
                                                        {isSelf && (
                                                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wide border border-blue-200">
                                                                Você
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-mono">{user.cpf || "Sem CPF"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${user.role === 'SECRETARIA' || user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                                                  user.role === 'DIRETOR' ? 'bg-blue-100 text-blue-800' :
                                                  user.role === 'GERENTE' ? 'bg-indigo-100 text-indigo-800' :
                                                  'bg-gray-100 text-gray-800'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {(user.role === 'SECRETARIA' || user.role === 'ADMIN') ? (
                                                <span className="text-gray-400 italic">Acesso Global</span>
                                            ) : (
                                                <div className="flex flex-col">
                                                    {user.diretoria ? (
                                                        <span className="font-medium">{user.diretoria.nome}</span>
                                                    ) : <span className="text-gray-400">-</span>}
                                                    
                                                    {user.gerencia && <span className="text-xs text-gray-500">↳ {user.gerencia.nome}</span>}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* [CORREÇÃO FINAL]: Se for você mesmo, esconde TODAS as ações */}
                                                {!isSelf ? (
                                                    <>
                                                        <button 
                                                            onClick={() => handleEdit(user)}
                                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" 
                                                            title="Editar"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRequestDelete(user)}
                                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" 
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic py-2 px-2 select-none">
                                                        --
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    
                    {filteredUsers.length === 0 && !isLoading && (
                        <div className="p-12 text-center text-gray-500">
                            Nenhum usuário encontrado.
                        </div>
                    )}
                    
                    {isLoading && (
                        <div className="p-12 text-center text-gray-500">
                            Carregando...
                        </div>
                    )}
                </div>
            </div>

            <UserModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={carregarUsuarios}
                userToEdit={userToEdit}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => { 
                    setIsDeleteModalOpen(false); 
                    setUserToDelete(null); 
                }}
                onConfirm={handleConfirmDelete}
                userName={userToDelete?.nome}
            />
        </div>
    );
}