"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  RefreshCw,
  Calendar,
  Search,
  Grid3X3,
  List,
  Eye,
  FileText,
  DollarSign,
  CreditCard,
  Users,
  ChevronRight,
  MoreHorizontal,
  Activity,
  BarChart3,
  Filter,
  Download,
  UserCheck,
  TrendingUp,
  CheckCircle,
  Stethoscope,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  Phone,
  Microscope,
  Clock4,
  AlertCircle,
  IdCard,
  User,
} from "lucide-react";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

import { useCompletedSchedules } from "@/hooks/useCompletedSchedules";
import { useCompletedScheduleFilters } from "@/hooks/useCompletedScheduleFilters";
import { CompletedScheduleDetailsModal } from "@/components/schedule/CompletedScheduleDetailsModal";
import { CompletedScheduleStats } from "@/components/schedule/CompletedScheduleStats";
import { consultaRoutes } from "@/Api/Routes/schedule/index.routes";
import { examRoutes } from "@/Api/Routes/Exam/index.route";

// Interface para agrupamento por paciente
interface PacienteAgendamento {
  id_paciente: number;
  paciente_nome: string;
  paciente_data_nascimento: string;
  paciente_sexo: string;
  paciente_contacto: string;
  paciente_numero_identificacao: string;
  exames: any[];
  consultas: any[];
  status: string;
  criado_aos: string;
}

// Função para agrupar agendamentos por paciente - CORRIGIDA
const agruparPorPaciente = (exames: any, consultas: any): PacienteAgendamento[] => {
  const pacientesMap = new Map<number, PacienteAgendamento>();

  // Função auxiliar para garantir que temos um array
  const toArray = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "object") {
      const possibleArrayProps = ["data", "results", "records", "items", "list", "array"];
      for (const prop of possibleArrayProps) {
        if (data[prop] && Array.isArray(data[prop])) {
          return data[prop];
        }
      }
      const values = Object.values(data);
      if (values?.length > 0 && Array.isArray(values[0])) {
        return values[0];
      }
      if (data[Symbol.iterator]) {
        return Array.from(data);
      }
    }
    return [];
  };

  const examesArray = toArray(exames);
  const consultasArray = toArray(consultas);

  // Processar exames
  examesArray.forEach((exame) => {
    try {
      // Para exames, o paciente pode estar em exame.Paciente OU exame.Agendamento.Paciente
      let pacienteInfo = exame?.Paciente;
      if (!pacienteInfo && exame?.Agendamento?.Paciente) {
        pacienteInfo = exame.Agendamento.Paciente;
      }

      if (pacienteInfo) {
        const pacienteId = pacienteInfo.id;
        const pacienteNome = pacienteInfo.nome_completo || "Paciente";

        if (!pacientesMap.has(pacienteId)) {
          pacientesMap.set(pacienteId, {
            id_paciente: pacienteId,
            paciente_nome: pacienteNome,
            paciente_data_nascimento: pacienteInfo.data_nascimento || "",
            paciente_sexo: pacienteInfo.id_sexo === 1 ? "Masculino" : pacienteInfo.id_sexo === 2 ? "Feminino" : "Não informado",
            paciente_contacto: pacienteInfo.contacto_telefonico || "",
            paciente_numero_identificacao: pacienteInfo.numero_identificacao || "",
            exames: [],
            consultas: [],
            status: exame.status || "PENDENTE",
            criado_aos: exame.criado_aos || new Date().toISOString(),
          });
        }
        const paciente = pacientesMap.get(pacienteId)!;
        paciente.exames.push(exame);
        if (exame.status === "PENDENTE") paciente.status = "PENDENTE";
      } else {
        console.warn("Exame sem informação de paciente:", exame);
      }
    } catch (error) {
      console.error("Erro ao processar exame:", exame, error);
    }
  });

  // Processar consultas
  consultasArray.forEach((consulta) => {
    try {
      // Para consultas, o paciente está em consulta.Agendamento.Paciente
      const pacienteInfo = consulta?.Agendamento?.Paciente;
      if (pacienteInfo) {
        const pacienteId = pacienteInfo.id;
        const pacienteNome = pacienteInfo.nome_completo || "Paciente";

        if (!pacientesMap.has(pacienteId)) {
          pacientesMap.set(pacienteId, {
            id_paciente: pacienteId,
            paciente_nome: pacienteNome,
            paciente_data_nascimento: pacienteInfo.data_nascimento || "",
            paciente_sexo: pacienteInfo.id_sexo === 1 ? "Masculino" : pacienteInfo.id_sexo === 2 ? "Feminino" : "Não informado",
            paciente_contacto: pacienteInfo.contacto_telefonico || "",
            paciente_numero_identificacao: pacienteInfo.numero_identificacao || "",
            exames: [],
            consultas: [],
            status: consulta.status || "PENDENTE",
            criado_aos: consulta.criado_aos || new Date().toISOString(),
          });
        }
        const paciente = pacientesMap.get(pacienteId)!;
        paciente.consultas.push(consulta);
        if (consulta.status === "PENDENTE") paciente.status = "PENDENTE";
      } else {
        console.warn("Consulta sem informação de paciente:", consulta);
      }
    } catch (error) {
      console.error("Erro ao processar consulta:", consulta, error);
    }
  });

  return Array.from(pacientesMap.values());
};

/* ---------------- HELPERS ---------------- */

const getExamStatuses = (exams: any[], maxVisible = 2) => {
  if (!exams || exams.length === 0) return [{ label: "Concluído", color: "emerald" }];

  const activeExams = exams.filter((exam) => exam.status !== "CONCLUIDO");

  if (activeExams.length === 0) {
    return [{ label: "Concluído", color: "emerald" }];
  }

  return activeExams.slice(0, maxVisible).map((exam) => {
    switch (exam.status) {
      case "PENDENTE":
        return { label: "Pendente", color: "amber" };
      case "EM_ANDAMENTO":
        return { label: "Em Andamento", color: "blue" };
      case "POR_REAGENDAR":
        return { label: "Por Reagendar", color: "orange" };
      case "CANCELADO":
        return { label: "Cancelado", color: "rose" };
      default:
        return { label: exam.status, color: "slate" };
    }
  });
};

const getPaymentStatus = (exams: any[]) => {
  if (!exams || exams.length === 0) return { label: "N/A", color: "slate" };

  const hasPendingPayment = exams.some((exam) => exam.status_pagamento === "PENDENTE");

  return hasPendingPayment ? { label: "Pendente", color: "amber" } : { label: "Pago", color: "emerald" };
};

const calculateTotalValue = (exams: any[]) => {
  if (!exams || exams.length === 0) return 0;
  return exams.reduce((sum, exam) => sum + (exam.Tipo_Exame?.preco || 0), 0);
};

const getPatientInitials = (name: string = "") => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getPatientAge = (birthDate: string) => {
  if (!birthDate) return "";
  const birth = new Date(birthDate);
  const today = new Date();
  const diff = today.getTime() - birth.getTime();
  const ageYears = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  if (ageYears > 0) return `${ageYears} ano${ageYears > 1 ? "s" : ""}`;
  const ageMonths = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  if (ageMonths > 0) return `${ageMonths} mês${ageMonths > 1 ? "es" : ""}`;
  const ageDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  return `${ageDays} dia${ageDays > 1 ? "s" : ""}`;
};

/* ---------------- COMPONENTES DE BLOCO ---------------- */

const ExamesBlock = ({ exames, pacienteId, expanded, onToggle }: { exames: any[]; pacienteId: number; expanded: boolean; onToggle: () => void }) => {
  if (exames?.length === 0) return null;

  const totalValor = exames.reduce((total, exame) => total + (exame?.Tipo_Exame?.preco || 0), 0);

  return (
    <Card className="w-full border-blue-200 border-l-4 mb-4">
      <CardHeader className="p-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Stethoscope className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-blue-800">Exames ({exames?.length})</CardTitle>
              <p className="text-sm text-gray-600 hidden sm:block">Agendamentos de exames laboratoriais</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {totalValor > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-xl font-bold text-green-700">
                  {new Intl.NumberFormat("pt-AO", {
                    style: "currency",
                    currency: "AOA",
                  }).format(totalValor)}
                </p>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={onToggle} className="p-1 self-end sm:self-center">
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              <span className="sr-only">Expandir/Recolher exames</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={expanded}>
        <CollapsibleContent>
          <CardContent className="p-4 pt-0">
            <div className="space-y-4">
              {exames?.map((exame, index) => (
                <div key={index} className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
                        <div className="mt-1 flex-shrink-0">
                          <Stethoscope className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg truncate">{exame?.Tipo_Exame?.nome || "Exame não especificado"}</h5>
                          {exame?.Tipo_Exame?.descricao && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{exame.Tipo_Exame.descricao}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {exame.data_agendamento && (
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-semibold text-gray-700">Data Agendada</span>
                            </div>
                            <p className="text-base font-bold text-gray-900">{format(new Date(exame.data_agendamento), "dd/MM/yyyy")}</p>
                            {isToday(new Date(exame.data_agendamento)) && <Badge className="mt-1 bg-blue-100 text-blue-700">Hoje</Badge>}
                          </div>
                        )}

                        {exame.hora_agendamento && (
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock4 className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-semibold text-gray-700">Hora Agendada</span>
                            </div>
                            <p className="text-base font-bold text-gray-900">{exame.hora_agendamento}</p>
                          </div>
                        )}

                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-700">Estado Clínico</span>
                          </div>
                          <Badge
                            className={`font-bold ${
                              exame.status === "PENDENTE"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                : exame.status === "EM_ANDAMENTO"
                                  ? "bg-cyan-100 text-cyan-800 hover:bg-cyan-100"
                                  : exame.status === "POR_REAGENDAR"
                                    ? "bg-teal-100 text-teal-800 hover:bg-teal-800"
                                    : exame.status === "CONCLUIDO"
                                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                                      : "bg-red-100 text-red-800 hover:bg-red-100"
                            }`}
                          >
                            {exame.status}
                          </Badge>
                        </div>

                        {exame?.Tipo_Exame?.preco > 0 && (
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-semibold text-gray-700">Valor</span>
                            </div>
                            <p className="text-base font-bold text-green-700">
                              {new Intl.NumberFormat("pt-AO", {
                                style: "currency",
                                currency: "AOA",
                              }).format(exame.Tipo_Exame.preco)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Informações adicionais */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <h6 className="font-semibold text-gray-700 mb-2">Informações do Pagamento</h6>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <span className="text-sm text-gray-600">Estado Financeiro:</span>
                              <Badge variant="outline" className={exame.status_pagamento === "PAGO" ? "bg-green-50 text-green-700 border-green-200" : exame.status_pagamento === "ISENTO" ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-red-50 text-red-700 border-red-200"}>
                                {exame.status_pagamento === "NAO_PAGO" ? "Não Pago" : exame.status_pagamento === "ISENTO" ? "Isento" : exame.status_pagamento === "PAGO" ? "Pago" : "Não Pago"}
                              </Badge>
                            </div>
                            {exame.isento && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Isenção:</span>
                                <Badge className="bg-gray-100 text-gray-800">ISENTO</Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        {exame.Agendamento && (
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <h6 className="font-semibold text-gray-700 mb-2">Dados do Agendamento</h6>
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <span className="text-sm text-gray-600">Criado em:</span>
                                <span className="text-sm font-medium">{format(new Date(exame.criado_aos), "dd/MM/yyyy HH:mm")}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const ConsultasBlock = ({ consultas, pacienteId, expanded, onToggle }: { consultas: any[]; pacienteId: number; expanded: boolean; onToggle: () => void }) => {
  if (consultas?.length === 0) return null;

  const totalValor = consultas.reduce((total, consulta) => total + (consulta?.Tipo_Consulta?.preco || 0), 0);

  return (
    <Card className="w-full border-green-200 border-l-4 mb-5">
      <CardHeader className="p-4 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-green-800">Consultas ({consultas?.length})</CardTitle>
              <p className="text-sm text-gray-600 hidden sm:block">Agendamentos de consultas médicas</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {totalValor > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-xl font-bold text-green-700">
                  {new Intl.NumberFormat("pt-AO", {
                    style: "currency",
                    currency: "AOA",
                  }).format(totalValor)}
                </p>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={onToggle} className="p-1 self-end sm:self-center">
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              <span className="sr-only">Expandir/Recolher consultas</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={expanded}>
        <CollapsibleContent>
          <CardContent className="p-4 pt-0">
            <div className="space-y-4">
              {consultas?.map((consulta, index) => (
                <div key={index} className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
                        <div className="mt-1 flex-shrink-0">
                          <FileText className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg truncate">{consulta?.Tipo_Consulta?.nome || "Consulta não especificada"}</h5>
                          {consulta?.Tipo_Consulta?.descricao && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{consulta.Tipo_Consulta.descricao}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {consulta.data_agendamento && (
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-semibold text-gray-700">Data</span>
                            </div>
                            <p className="text-base font-bold text-gray-900">{format(new Date(consulta.data_agendamento), "dd/MM/yyyy")}</p>
                            {isToday(new Date(consulta.data_agendamento)) && <Badge className="mt-1 bg-blue-100 text-blue-700">Hoje</Badge>}
                          </div>
                        )}

                        {consulta.hora_agendamento && (
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock4 className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-semibold text-gray-700">Hora</span>
                            </div>
                            <p className="text-base font-bold text-gray-900">{consulta.hora_agendamento}</p>
                          </div>
                        )}

                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-700">Status</span>
                          </div>
                          <Badge className={`font-bold ${consulta.status === "PENDENTE" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : consulta.status === "CONCLUIDO" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}`}>
                            {consulta.status}
                          </Badge>
                        </div>

                        {consulta?.Tipo_Consulta?.preco > 0 && (
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-semibold text-gray-700">Valor</span>
                            </div>
                            <p className="text-base font-bold text-green-700">
                              {new Intl.NumberFormat("pt-AO", {
                                style: "currency",
                                currency: "AOA",
                              }).format(consulta.Tipo_Consulta.preco)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Informações adicionais */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <h6 className="font-semibold text-gray-700 mb-2">Informações do Pagamento</h6>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Status:</span>
                              <Badge variant="outline" className={consulta.status_pagamento === "PAGO" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                                {consulta.status_pagamento}
                              </Badge>
                            </div>
                            {consulta.isento && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Isenção:</span>
                                <Badge className="bg-gray-100 text-gray-800">ISENTO</Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        {consulta.Agendamento && (
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <h6 className="font-semibold text-gray-700 mb-2">Dados do Agendamento</h6>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Criado em:</span>
                                <span className="text-sm font-medium">{format(new Date(consulta.criado_aos), "dd/MM/yyyy HH:mm")}</span>
                              </div>
                              {consulta.Agendamento.id_unidade_de_saude && (
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Unidade:</span>
                                  <span className="text-sm font-medium">{consulta.Agendamento.id_unidade_de_saude}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

/* ---------------- COMPONENTE PRINCIPAL ---------------- */

export default function CompletedSchedulesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showStats, setShowStats] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [selectedSchedules, setSelectedSchedules] = useState<number[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedExames, setExpandedExames] = useState<Set<number>>(new Set());
  const [expandedConsultas, setExpandedConsultas] = useState<Set<number>>(new Set());
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // Buscar exames
  const {
    data: examesRaw,
    isLoading: isLoadingExames,
    isError: isErrorExames,
  } = useQuery<any[]>({
    queryKey: ["exams-pending"],
    queryFn: async (): Promise<any[]> => {
      try {
        const response = await examRoutes.getPendingExams();
        const responseData = response as any;

        if (Array.isArray(responseData)) return responseData;

        if (responseData && typeof responseData === "object") {
          const possibleDataProps = ["data", "results", "records", "items", "exames"];
          for (const prop of possibleDataProps) {
            if (responseData[prop] && Array.isArray(responseData[prop])) {
              return responseData[prop];
            }
          }

          const values = Object.values(responseData);
          for (const value of values) {
            if (Array.isArray(value)) {
              return value;
            }
          }

          if (responseData.id !== undefined && responseData.Exame) {
            return [responseData];
          }
        }

        console.warn("Formato não reconhecido, retornando array vazio");
        return [];
      } catch (error) {
        console.error("Erro ao buscar exames:", error);
        return [];
      }
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  // Buscar consultas
  const {
    data: consultasRaw,
    isLoading: isLoadingConsultas,
    isError: isErrorConsultas,
  } = useQuery({
    queryKey: ["pending-consultas"],
    queryFn: async () => {
      try {
        const response = (await consultaRoutes.getPendingConsultas()) as any;

        if (Array.isArray(response)) return response;

        if (response && typeof response === "object") {
          const possibleDataProps = ["data", "results", "records", "items", "consultas"];
          for (const prop of possibleDataProps) {
            if (response[prop] && Array.isArray(response[prop])) {
              return response[prop];
            }
          }

          const values = Object.values(response);
          for (const value of values) {
            if (Array.isArray(value)) {
              return value;
            }
          }

          if (response.id !== undefined && response.Tipo_Consulta) {
            return [response];
          }
        }

        console.warn("Formato não reconhecido, retornando array vazio");
        return [];
      } catch (error) {
        console.error("Erro ao buscar consultas:", error);
        return [];
      }
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  // Usar hooks existentes
  const { schedules, statistics, isLoading, isError, refetch, isRefetching } = useCompletedSchedules();

  // Converter dados para arrays
  const exames = useMemo(() => {
    if (!examesRaw) return [];
    if (Array.isArray(examesRaw)) return examesRaw;
    return [];
  }, [examesRaw]);

  const consultas = useMemo(() => {
    if (!consultasRaw) return [];
    if (Array.isArray(consultasRaw)) return consultasRaw;
    return [];
  }, [consultasRaw]);

  // Agrupar por paciente
  const pacientesAgendamentos = useMemo(() => {
    return agruparPorPaciente(exames, consultas);
  }, [exames, consultas]);

  // Usar filtros
  const { filteredSchedules, handleSearch, filters, clearFilters } = useCompletedScheduleFilters(pacientesAgendamentos as any);

  const filteredCount = filteredSchedules.length;

  // Handlers para expansão
  const toggleExamesExpansion = (pacienteId: number) => {
    const newExpanded = new Set(expandedExames);
    if (newExpanded.has(pacienteId)) {
      newExpanded.delete(pacienteId);
    } else {
      newExpanded.add(pacienteId);
    }
    setExpandedExames(newExpanded);
  };

  const toggleConsultasExpansion = (pacienteId: number) => {
    const newExpanded = new Set(expandedConsultas);
    if (newExpanded.has(pacienteId)) {
      newExpanded.delete(pacienteId);
    } else {
      newExpanded.add(pacienteId);
    }
    setExpandedConsultas(newExpanded);
  };

  const handleViewDetails = (paciente: PacienteAgendamento) => {
    setSelectedSchedule(paciente);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedSchedule(null);
    setIsDetailsModalOpen(false);
  };

  const handleViewReport = (schedule: any) => {
    console.log("Gerar relatório para:", schedule.id);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSchedules(filteredSchedules.map((s: any) => s.id_paciente));
    } else {
      setSelectedSchedules([]);
    }
  };

  const handleSelectSchedule = (scheduleId: number, checked: boolean) => {
    if (checked) {
      setSelectedSchedules((prev) => [...prev, scheduleId]);
    } else {
      setSelectedSchedules((prev) => prev.filter((id) => id !== scheduleId));
    }
  };

  // Componente de Cabeçalho do Paciente
  const PacienteHeader = ({ paciente, onViewDetails }: { paciente: PacienteAgendamento; onViewDetails?: () => void }) => {
    const hasExames = paciente.exames?.length > 0;
    const hasConsultas = paciente.consultas?.length > 0;
    const totalItens = paciente.exames?.length + paciente.consultas?.length;

    return (
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">{getPatientInitials(paciente.paciente_nome)}</div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{paciente.paciente_nome}</h2>

                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {hasExames && (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-300 text-xs">
                      <Stethoscope className="w-3 h-3 mr-1" />
                      {paciente.exames?.length} Exame(s)
                    </Badge>
                  )}
                  {hasConsultas && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-300 text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      {paciente.consultas?.length} Consulta(s)
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-gray-300 text-xs">
                    {totalItens} Itens
                  </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={onViewDetails} className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Ver Detalhes</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {paciente.paciente_numero_identificacao && (
                  <div className="flex items-center gap-2 truncate">
                    <IdCard className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700 truncate">
                      <span className="font-semibold">BI:</span> {paciente.paciente_numero_identificacao}
                    </span>
                  </div>
                )}

                {paciente.paciente_sexo && (
                  <div className="flex items-center gap-2 truncate">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700 truncate">
                      <span className="font-semibold">Sexo:</span> {paciente.paciente_sexo}
                    </span>
                  </div>
                )}

                {paciente.paciente_contacto && (
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700 truncate">
                      <span className="font-semibold">Contacto:</span> {paciente.paciente_contacto}
                    </span>
                  </div>
                )}

                {paciente.paciente_data_nascimento && (
                  <div className="flex items-center gap-2 truncate">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700 truncate">
                      <span className="font-semibold">Nascimento:</span> {format(new Date(paciente.paciente_data_nascimento), "dd/MM/yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2 sm:gap-3 mt-2 sm:mt-0">
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-gray-600">Status Geral</p>
              <Badge
                className={`text-xs sm:text-sm font-bold ${paciente.status === "PENDENTE" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : paciente.status === "APROVADO" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}`}
              >
                {paciente.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente Principal do Card do Paciente
  const PacienteCard = ({ paciente, onViewDetails }: { paciente: PacienteAgendamento; onViewDetails?: () => void }) => {
    return (
      <div className="space-y-3 sm:space-y-4">
        <Card className="w-full overflow-hidden border border-gray-300 shadow-lg">
          {/* Cabeçalho do Paciente */}
          <PacienteHeader paciente={paciente} onViewDetails={onViewDetails} />

          <CardContent className="p-3 sm:p-4">
            {/* Bloco de Exames */}
            <ExamesBlock exames={paciente.exames} pacienteId={paciente.id_paciente} expanded={expandedExames.has(paciente.id_paciente)} onToggle={() => toggleExamesExpansion(paciente.id_paciente)} />

            {/* Bloco de Consultas */}
            <ConsultasBlock consultas={paciente.consultas} pacienteId={paciente.id_paciente} expanded={expandedConsultas.has(paciente.id_paciente)} onToggle={() => toggleConsultasExpansion(paciente.id_paciente)} />
          </CardContent>
        </Card>
      </div>
    );
  };

  // Verificar erros de carregamento
  const isLoadingData = isLoadingExames || isLoadingConsultas;
  const hasError = isErrorExames || isErrorConsultas;

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50 shadow-xl">
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Erro ao carregar dados</h3>
                  <p className="text-gray-600 mt-1">Não foi possível carregar os agendamentos. Verifique sua conexão.</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => refetch()} className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-akin-turquoise to-akin-turquoise rounded-xl shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Agendamentos Pendentes</h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base">Controle completo de exames e consultas em tempo real</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-sm px-4 py-2 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
            </Badge>

            <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)} className="border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              {showStats ? "Ocultar" : "Mostrar"} Estatísticas
            </Button>

            <Button variant="outline" size="sm" onClick={() => refetch()} className="border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white">
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
          <Input placeholder="Buscar por paciente, exame ou status..." className="pl-11 h-11 text-base border-1 border bg-white/90  rounded-xl focus:border-blue-500 focus:ring-0 transition-all" value={filters.searchQuery} onChange={(e) => handleSearch(e.target.value)} />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Badge variant="secondary" className="px-3 py-1.5 bg-blue-50 text-blue-700 border-blue-200">
              {filteredCount} resultados
            </Badge>
          </div>
        </div>

        {/* FILTERS ROW */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm mb-2 block">Tipo de Serviço</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os serviços</SelectItem>
                  <SelectItem value="exams">Apenas exames</SelectItem>
                  <SelectItem value="consultations">Apenas consultas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-2 block">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Todos status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-end">
            <Button variant="ghost" onClick={() => clearFilters()} className="border-gray-200">
              <X className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </div>

        {/* STATISTICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 bg-gradient-to-br from-white to-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700">Total de Pacientes</CardTitle>
                <div className="p-2.5 bg-blue-100 rounded-lg">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{pacientesAgendamentos.length || 0}</span>
                  <span className="text-sm text-gray-500">pacientes</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-white to-emerald-50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700">Exames Pendentes</CardTitle>
                <div className="p-2.5 bg-emerald-100 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{exames.length || 0}</span>
                  <span className="text-sm text-gray-500">exames</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-white to-amber-50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700">Consultas Pendentes</CardTitle>
                <div className="p-2.5 bg-amber-100 rounded-lg">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{consultas.length || 0}</span>
                  <span className="text-sm text-gray-500">consultas</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-white to-purple-50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700">Total de Itens</CardTitle>
                <div className="p-2.5 bg-purple-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{exames.length + consultas.length || 0}</span>
                  <span className="text-sm text-gray-500">itens</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs value={viewMode}>
            <TabsList className="bg-gray-100 p-1 rounded-xl">
              <TabsTrigger value="grid" onClick={() => setViewMode("grid")} className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg px-4 py-2">
                <Grid3X3 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Visualização em Cards</span>
                <span className="sm:hidden">Cards</span>
              </TabsTrigger>
              <TabsTrigger value="list" onClick={() => setViewMode("list")} className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg px-4 py-2">
                <List className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Visualização em Lista</span>
                <span className="sm:hidden">Lista</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3">
            {selectedSchedules.length > 0 && (
              <>
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedSchedules.length} selecionados
                </Badge>
                <Button variant="default" size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar ({selectedSchedules.length})
                </Button>
              </>
            )}

            <Button variant="outline" size="sm" onClick={clearFilters} className="border-gray-200 hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </div>

        <Separator />

        {/* CONTENT */}
        {isLoadingData ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredSchedules.length === 0 ? (
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center shadow-lg">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Nenhum agendamento encontrado</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">{pacientesAgendamentos.length === 0 ? "Não há agendamentos pendentes disponíveis." : "Tente ajustar os filtros ou a busca para encontrar o que procura."}</p>
              {filters.searchQuery && (
                <Button variant="outline" onClick={() => handleSearch("")} className="border-gray-200 hover:bg-gray-50">
                  Limpar busca
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="space-y-6">
            {filteredSchedules.map((paciente: any) => (
              <PacienteCard key={paciente.id_paciente} paciente={paciente} onViewDetails={() => handleViewDetails(paciente)} />
            ))}
          </div>
        ) : (
          // LIST VIEW
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="text-left p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedSchedules.length === filteredSchedules.length && filteredSchedules.length > 0}
                            onChange={(e) => setSelectedSchedules(e.target.checked ? filteredSchedules.map((p: any) => p.id_paciente) : [])}
                            className="rounded border-gray-300"
                          />
                        </div>
                      </th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Paciente</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Itens</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Data</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="text-left p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSchedules.map((paciente: any) => {
                      const totalExames = paciente.exames.length;
                      const totalConsultas = paciente.consultas.length;
                      const totalItens = totalExames + totalConsultas;
                      const creationDate = paciente.criado_aos ? format(new Date(paciente.criado_aos), "dd/MM/yyyy", { locale: ptBR }) : "N/A";

                      return (
                        <tr key={paciente.id_paciente} className="hover:bg-blue-50/30 transition-colors">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedSchedules.includes(paciente.id_paciente)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSchedules((prev) => [...prev, paciente.id_paciente]);
                                } else {
                                  setSelectedSchedules((prev) => prev.filter((id) => id !== paciente.id_paciente));
                                }
                              }}
                              className="rounded border-gray-300"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow">
                                <span className="text-sm font-bold text-white">{getPatientInitials(paciente.paciente_nome)}</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{paciente.paciente_nome}</div>
                                <div className="text-sm text-gray-500">{paciente.paciente_numero_identificacao || "Sem identificação"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              {totalExames > 0 && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                  {totalExames} exame{totalExames > 1 ? "s" : ""}
                                </Badge>
                              )}
                              {totalConsultas > 0 && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                  {totalConsultas} consulta{totalConsultas > 1 ? "s" : ""}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900">{creationDate}</div>
                              {paciente.criado_aos && <div className="text-xs text-gray-500">{format(new Date(paciente.criado_aos), "HH:mm")}</div>}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={`text-xs px-3 py-1 ${paciente.status === "PENDENTE" ? "bg-yellow-50 text-yellow-700" : paciente.status === "APROVADO" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}`}>{paciente.status}</Badge>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleViewDetails(paciente)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewReport(paciente)}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Gerar Relatório
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Exportar Dados
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal de Detalhes */}
        {selectedSchedule && (
          <CompletedScheduleDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={handleCloseDetailsModal}
            schedule={selectedSchedule}
            content={
              selectedSchedule && (
                <div className="space-y-6">
                  <PacienteHeader paciente={selectedSchedule} />
                  <ExamesBlock exames={selectedSchedule.exames} pacienteId={selectedSchedule.id_paciente} expanded={expandedExames.has(selectedSchedule.id_paciente)} onToggle={() => toggleExamesExpansion(selectedSchedule.id_paciente)} />
                  <ConsultasBlock consultas={selectedSchedule.consultas} pacienteId={selectedSchedule.id_paciente} expanded={expandedConsultas.has(selectedSchedule.id_paciente)} onToggle={() => toggleConsultasExpansion(selectedSchedule.id_paciente)} />
                </div>
              )
            }
          />
        )}
      </div>
    </div>
  );
}
