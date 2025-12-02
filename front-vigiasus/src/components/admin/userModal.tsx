// src/components/admin/UserModal.tsx
"use client";

import React, { useEffect, useState } from "react"; // [CORREÇÃO]: Importação do React
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { showSuccessToast, showErrorToast } from "@/components/ui/Toasts";
import { criarUsuario, atualizarUsuario, type Usuario } from "@/services/usuarioService";
import { getDiretorias, getGerencias, type Diretoria, type Gerencia } from "@/services/organizacaoService";
import { Loader2, Save, KeyRound } from "lucide-react";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userToEdit?: Usuario | null;
}

export default function UserModal({ isOpen, onClose, onSuccess, userToEdit }: UserModalProps) {
    const isEditing = !!userToEdit;
    const [loading, setLoading] = useState(false);
    
    // Dados do Formulário
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [cpf, setCpf] = useState("");
    const [role, setRole] = useState<string>("MEMBRO");
    const [diretoriaId, setDiretoriaId] = useState<string>("");
    const [gerenciaId, setGerenciaId] = useState<string>("");
    const [password, setPassword] = useState("");

    // Listas para Selects
    const [diretorias, setDiretorias] = useState<Diretoria[]>([]);
    const [gerencias, setGerencias] = useState<Gerencia[]>([]);

    // Carregar listas ao abrir
    useEffect(() => {
        if (isOpen) {
            // Carrega dados auxiliares
            getDiretorias().then(setDiretorias).catch(console.error);
            getGerencias().then(setGerencias).catch(console.error);
            
            if (userToEdit) {
                setNome(userToEdit.nome);
                setEmail(userToEdit.email || "");
                setCpf(userToEdit.cpf);
                setRole(userToEdit.role);
                setDiretoriaId(userToEdit.diretoriaId || "");
                setGerenciaId(userToEdit.gerenciaId || "");
                setPassword(""); // Senha vazia na edição
            } else {
                // Reset para criação
                setNome(""); setEmail(""); setCpf(""); setRole("MEMBRO");
                setDiretoriaId(""); setGerenciaId(""); setPassword("");
            }
        }
    }, [isOpen, userToEdit]);

    // Filtrar gerências baseadas na diretoria selecionada
    const gerenciasFiltradas = diretoriaId 
        ? gerencias.filter(g => g.diretoriaId === diretoriaId)
        : gerencias;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: any = {
                nome,
                email,
                cpf,
                role,
                // Admin e Secretaria não têm diretoria/gerência
                diretoriaId: (['DIRETOR', 'GERENTE', 'MEMBRO'].includes(role)) ? diretoriaId : null,
                gerenciaId: (['GERENTE', 'MEMBRO'].includes(role)) ? gerenciaId : null,
            };

            // Só envia senha se foi digitada ou se é criação
            if (password) {
                payload.password = password;
            } else if (!isEditing) {
                throw new Error("Senha é obrigatória para novos usuários.");
            }

            if (isEditing && userToEdit) {
                await atualizarUsuario(userToEdit.id, payload);
                showSuccessToast("Usuário atualizado com sucesso!");
            } else {
                await criarUsuario(payload);
                showSuccessToast("Usuário criado com sucesso!");
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            showErrorToast(err.message || "Erro ao salvar usuário.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-white">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                            <input 
                                className="w-full p-2 border rounded-md" 
                                value={nome} onChange={e => setNome(e.target.value)} required 
                            />
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-gray-700">CPF</label>
                            <input 
                                className="w-full p-2 border rounded-md" 
                                value={cpf} onChange={e => setCpf(e.target.value)} required 
                                disabled={isEditing} // CPF imutável
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">E-mail</label>
                            <input 
                                type="email"
                                className="w-full p-2 border rounded-md" 
                                value={email} onChange={e => setEmail(e.target.value)} 
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700">Perfil de Acesso</label>
                            <select 
                                className="w-full p-2 border rounded-md bg-white"
                                value={role}
                                onChange={e => {
                                    setRole(e.target.value);
                                    // Limpa campos inferiores ao mudar hierarquia
                                    if (['ADMIN', 'SECRETARIA'].includes(e.target.value)) { 
                                        setDiretoriaId(""); 
                                        setGerenciaId(""); 
                                    }
                                    if (e.target.value === 'DIRETOR') { setGerenciaId(""); }
                                }}
                            >
                                <option value="MEMBRO">Membro (Acesso Padrão)</option>
                                <option value="GERENTE">Gerente (Gestor de Área)</option>
                                <option value="DIRETOR">Diretor (Gestor de Diretoria)</option>
                                <option value="SECRETARIA">Secretaria (Visão Global - Leitura)</option>
                                <option value="ADMIN">Administrador do Sistema (TI)</option>
                            </select>
                        </div>

                        {/* Diretoria: Aparece para Diretor, Gerente e Membro (Não aparece para Admin/Secretaria) */}
                        {['DIRETOR', 'GERENTE', 'MEMBRO'].includes(role) && (
                            <div className={role === 'DIRETOR' ? "col-span-2" : "col-span-1"}>
                                <label className="text-sm font-medium text-gray-700">Diretoria</label>
                                <select 
                                    className="w-full p-2 border rounded-md bg-white"
                                    value={diretoriaId}
                                    onChange={e => {
                                        setDiretoriaId(e.target.value);
                                        // Reseta gerência se mudar diretoria
                                        setGerenciaId("");
                                    }}
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {diretorias.map(d => (
                                        <option key={d.id} value={d.id}>{d.nome}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Gerência: Aparece apenas para Gerente e Membro */}
                        {['GERENTE', 'MEMBRO'].includes(role) && (
                            <div className="col-span-1">
                                <label className="text-sm font-medium text-gray-700">Gerência</label>
                                <select 
                                    className="w-full p-2 border rounded-md bg-white"
                                    value={gerenciaId}
                                    onChange={e => setGerenciaId(e.target.value)}
                                    required
                                    disabled={!diretoriaId} // Obriga selecionar diretoria antes
                                >
                                    <option value="">Selecione...</option>
                                    {gerenciasFiltradas.map(g => (
                                        <option key={g.id} value={g.id}>{g.nome}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="col-span-2 border-t pt-4 mt-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <KeyRound size={16} /> 
                                {isEditing ? "Redefinir Senha (Opcional)" : "Senha Inicial"}
                            </label>
                            <input 
                                type="password"
                                className="w-full p-2 border rounded-md" 
                                placeholder={isEditing ? "Deixe em branco para manter a atual" : "Digite a senha"}
                                value={password} onChange={e => setPassword(e.target.value)} 
                                required={!isEditing}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
                            Salvar Usuário
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}