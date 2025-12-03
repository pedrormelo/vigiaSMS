// src/components/admin/userModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { showSuccessToast, showErrorToast } from "@/components/ui/Toasts";
import { criarUsuario, atualizarUsuario, type Usuario } from "@/services/usuarioService";
import { getDiretorias, getGerencias, type Diretoria, type Gerencia } from "@/services/organizacaoService";
import { Loader2, Save, KeyRound, User, FileText, Mail, Building2, AlertCircle } from "lucide-react";

// --- UTILITÁRIOS DE VALIDAÇÃO ---

const formatarCPF = (value: string) => {
    return value
        .replace(/\D/g, "") // Remove tudo o que não é dígito
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1"); // Limita a 11 dígitos
};

const validarCPF = (cpf: string): boolean => {
    const strCPF = cpf.replace(/[^\d]+/g, '');
    if (strCPF.length !== 11 || !!strCPF.match(/(\d)\1{10}/)) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) soma = soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;

    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(strCPF.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma = soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;

    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(strCPF.substring(10, 11))) return false;

    return true;
};

const validarEmail = (email: string): boolean => {
    if (!email) return true; // Email é opcional na sua regra, se preenchido deve ser válido
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

// --- COMPONENTE ---

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

    // Erros de Validação
    const [errors, setErrors] = useState<{ cpf?: string; email?: string }>({});

    // Listas para Selects
    const [diretorias, setDiretorias] = useState<Diretoria[]>([]);
    const [gerencias, setGerencias] = useState<Gerencia[]>([]);

    // Carregar listas ao abrir
    useEffect(() => {
        if (isOpen) {
            setErrors({});
            getDiretorias().then(setDiretorias).catch(console.error);
            getGerencias().then(setGerencias).catch(console.error);
            
            if (userToEdit) {
                setNome(userToEdit.nome);
                setEmail(userToEdit.email || "");
                setCpf(formatarCPF(userToEdit.cpf)); // Formata ao carregar
                setRole(userToEdit.role);
                setDiretoriaId(userToEdit.diretoriaId || "");
                setGerenciaId(userToEdit.gerenciaId || "");
                setPassword("");
            } else {
                setNome(""); setEmail(""); setCpf(""); setRole("MEMBRO");
                setDiretoriaId(""); setGerenciaId(""); setPassword("");
            }
        }
    }, [isOpen, userToEdit]);

    // Filtrar gerências baseadas na diretoria selecionada
    const gerenciasFiltradas = diretoriaId 
        ? gerencias.filter(g => g.diretoriaId === diretoriaId)
        : gerencias;

    // --- HANDLERS DE MUDANÇA COM VALIDAÇÃO EM TEMPO REAL ---

    const handleChangeCPF = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatarCPF(e.target.value);
        setCpf(formatted);
        
        // Limpa erro ao digitar
        if (errors.cpf) setErrors(prev => ({ ...prev, cpf: undefined }));
    };

    const handleBlurCPF = () => {
        if (cpf && !validarCPF(cpf)) {
            setErrors(prev => ({ ...prev, cpf: "CPF inválido." }));
        }
    };

    const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
    };

    const handleBlurEmail = () => {
        if (email && !validarEmail(email)) {
            setErrors(prev => ({ ...prev, email: "E-mail inválido." }));
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validação final antes de enviar
        const cpfValido = validarCPF(cpf);
        const emailValido = !email || validarEmail(email);
        
        if (!cpfValido || !emailValido) {
            setErrors({
                cpf: !cpfValido ? "CPF inválido." : undefined,
                email: !emailValido ? "E-mail inválido." : undefined
            });
            showErrorToast("Corrija os erros antes de salvar.");
            return;
        }

        setLoading(true);

        try {
            const payload: any = {
                nome,
                email,
                cpf: cpf.replace(/\D/g, ""), // Remove formatação para enviar ao backend
                role,
                diretoriaId: (['DIRETOR', 'GERENTE', 'MEMBRO'].includes(role)) ? diretoriaId : null,
                gerenciaId: (['GERENTE', 'MEMBRO'].includes(role)) ? gerenciaId : null,
            };

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
            <DialogContent className="sm:max-w-[600px] bg-white rounded-2xl shadow-xl border-0">
                <DialogHeader className=" pb-4 mb-4">
                    <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {isEditing ? <User className="text-blue-600" /> : <User className="text-green-600" />}
                        {isEditing ? "Editar Usuário" : "Novo Usuário"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Nome */}
                        <div className="col-span-2">
                            <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                                <User size={14} /> Nome Completo <span className="text-red-500">*</span>
                            </label>
                            <input 
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" 
                                value={nome} onChange={e => setNome(e.target.value)} required 
                                placeholder="Ex: João da Silva"
                            />
                        </div>
                        
                        {/* CPF */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                                <FileText size={14} /> CPF <span className="text-red-500">*</span>
                            </label>
                            <input 
                                className={`w-full px-3 py-2 rounded-xl border focus:outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500 ${
                                    errors.cpf 
                                        ? "border-red-500 focus:ring-2 focus:ring-red-200" 
                                        : "border-gray-200 focus:ring-2 focus:ring-blue-500"
                                }`}
                                value={cpf} 
                                onChange={handleChangeCPF}
                                onBlur={handleBlurCPF}
                                required 
                                disabled={isEditing} 
                                placeholder="000.000.000-00"
                                maxLength={14}
                            />
                            {errors.cpf && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    <AlertCircle size={10} /> {errors.cpf}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                                <Mail size={14} /> E-mail
                            </label>
                            <input 
                                type="email"
                                className={`w-full px-3 py-2 rounded-xl border focus:outline-none transition-all ${
                                    errors.email 
                                        ? "border-red-500 focus:ring-2 focus:ring-red-200" 
                                        : "border-gray-200 focus:ring-2 focus:ring-blue-500"
                                }`}
                                value={email} 
                                onChange={handleChangeEmail}
                                onBlur={handleBlurEmail}
                                placeholder="email@exemplo.com"
                            />
                             {errors.email && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    <AlertCircle size={10} /> {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Perfil */}
                        <div className="col-span-2">
                            <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                                Perfil de Acesso <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select 
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none transition-all"
                                    value={role}
                                    onChange={e => {
                                        setRole(e.target.value);
                                        if (['ADMIN', 'SECRETARIA'].includes(e.target.value)) { 
                                            setDiretoriaId(""); setGerenciaId(""); 
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
                        </div>

                        {/* Diretoria */}
                        {['DIRETOR', 'GERENTE', 'MEMBRO'].includes(role) && (
                            <div className={role === 'DIRETOR' ? "col-span-2" : "col-span-1"}>
                                <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                                    <Building2 size={14} /> Diretoria <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                    value={diretoriaId}
                                    onChange={e => {
                                        setDiretoriaId(e.target.value);
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

                        {/* Gerência */}
                        {['GERENTE', 'MEMBRO'].includes(role) && (
                            <div className="col-span-1">
                                <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                                    Gerência <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                    value={gerenciaId}
                                    onChange={e => setGerenciaId(e.target.value)}
                                    required
                                    disabled={!diretoriaId}
                                >
                                    <option value="">Selecione...</option>
                                    {gerenciasFiltradas.map(g => (
                                        <option key={g.id} value={g.id}>{g.nome}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Senha */}
                        <div className="col-span-2 pt-4 border-t border-gray-100 mt-2">
                            <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                                <KeyRound size={14} /> 
                                {isEditing ? "Redefinir Senha (Opcional)" : "Senha Inicial"}
                                {!isEditing && <span className="text-red-500">*</span>}
                            </label>
                            <input 
                                type="password"
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" 
                                placeholder={isEditing ? "Deixe em branco para manter a atual" : "Digite a senha"}
                                value={password} onChange={e => setPassword(e.target.value)} 
                                required={!isEditing}
                            />
                            {isEditing && <p className="text-xs text-gray-400 mt-1">Preencha apenas se desejar alterar a senha do usuário.</p>}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onClose} 
                            disabled={loading}
                            className="rounded-xl border-gray-200 hover:bg-gray-50"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md" 
                            disabled={loading || !!errors.cpf || !!errors.email}
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
                            {isEditing ? "Atualizar Usuário" : "Criar Usuário"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}