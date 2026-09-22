// =========================================
// SLA - CONECTA21 (Sprint 3)
// Lógica reutilizável de indicadores visuais.
// Fonte oficial: KanbanCardDTO { status, prioridade,
// dataAbertura, dataLimiteResolucao }.
// Regra de negócio (prazo) pertence ao backend;
// aqui só apresentação.
// =========================================

const SLA_HORAS = {
    ALTA: 4,
    MEDIA: 24,
    BAIXA: 48
};

function normalizarStatusSla(status) {
    return String(status || "")
        .trim()
        .toUpperCase();
}

function getDataLimiteSla(chamado) {
    if (!chamado) {
        return null;
    }
    return (
        chamado.dataLimiteResolucao ||
        chamado.slaDeadline ||
        chamado.dataVencimento ||
        chamado.prazo ||
        null
    );
}

function getDataAberturaSla(chamado) {
    if (!chamado) {
        return null;
    }
    return chamado.dataAbertura || chamado.dataCriacao || chamado.criadoEm || null;
}

// Retorna: normal | proximo | atrasado | sem-dados
function getSlaStatus(chamado) {
    if (!chamado) {
        return { key: "sem-dados", label: "SLA indisponível", icon: "—" };
    }

    const status = normalizarStatusSla(chamado.status);

    if (status === "EM_ATRASO") {
        return { key: "atrasado", label: "EM ATRASO", icon: "!" };
    }

    if (status === "RESOLVIDO" || status === "FECHADO") {
        const limiteFechado = getDataLimiteSla(chamado);
        const fechamento = chamado.dataFechamento || null;
        if (limiteFechado && fechamento) {
            const atraso = new Date(fechamento) - new Date(limiteFechado);
            if (atraso > 0) {
                return { key: "atrasado", label: "EM ATRASO", icon: "!" };
            }
        }
        return { key: "normal", label: "Dentro do SLA", icon: "✓" };
    }

    const limiteRaw = getDataLimiteSla(chamado);

    if (!limiteRaw) {
        return { key: "sem-dados", label: "SLA indisponível", icon: "—" };
    }

    const agora = new Date();
    const limite = new Date(limiteRaw);

    if (isNaN(limite.getTime())) {
        return { key: "sem-dados", label: "SLA indisponível", icon: "—" };
    }

    if (agora.getTime() > limite.getTime()) {
        return { key: "atrasado", label: "EM ATRASO", icon: "!" };
    }

    const aberturaRaw = getDataAberturaSla(chamado);
    const abertura = aberturaRaw ? new Date(aberturaRaw) : null;
    const totalMs =
        abertura && !isNaN(abertura.getTime())
            ? limite.getTime() - abertura.getTime()
            : null;
    const restanteMs = limite.getTime() - agora.getTime();

    const DUAS_HORAS_MS = 2 * 60 * 60 * 1000;
    const pertoPorTempo = restanteMs <= DUAS_HORAS_MS;
    const pertoPorPercentual =
        totalMs && totalMs > 0 ? restanteMs / totalMs <= 0.2 : false;

    if (pertoPorTempo || pertoPorPercentual) {
        return { key: "proximo", label: "Próximo do vencimento", icon: "⚠" };
    }

    return { key: "normal", label: "Dentro do SLA", icon: "✓" };
}

function describeSlaTooltip(chamado, sla) {
    const limiteRaw = getDataLimiteSla(chamado);
    if (!limiteRaw || !sla || sla.key === "sem-dados") {
        return "Sem data limite de SLA retornada pela API.";
    }
    try {
        const limite = new Date(limiteRaw);
        const texto = isNaN(limite.getTime())
            ? String(limiteRaw)
            : limite.toLocaleString("pt-BR");
        if (sla.key === "atrasado") {
            return "Prazo estourado. Limite: " + texto;
        }
        if (sla.key === "proximo") {
            return "Atenção: vence em breve. Limite: " + texto;
        }
        return "Dentro do prazo. Limite: " + texto;
    } catch (e) {
        return "Limite de SLA: " + String(limiteRaw);
    }
}

function renderSlaBadge(sla, tooltip) {
    const key = sla && sla.key ? sla.key : "sem-dados";
    const icon = sla && sla.icon ? sla.icon : "—";
    const label = sla && sla.label ? sla.label : "SLA indisponível";
    const title = tooltip
        ? ' title="' + String(tooltip).replace(/"/g, "&quot;") + '"'
        : "";

    return (
        '<span class="sla-badge sla-' +
        key +
        '"' +
        title +
        '><span class="sla-icon" aria-hidden="true">' +
        icon +
        "</span> " +
        label +
        "</span>"
    );
}

function formatarPrioridade(valor) {
    const v = String(valor || "")
        .trim()
        .toUpperCase();
    if (v === "ALTA") {
        return "Alta";
    }
    if (v === "MEDIA") {
        return "Média";
    }
    if (v === "BAIXA") {
        return "Baixa";
    }
    if (v === "CRITICA" || v === "CRÍTICA") {
        return "Crítica";
    }
    return valor || "—";
}

function formatarStatus(valor) {
    const v = String(valor || "")
        .trim()
        .toUpperCase();
    if (v === "ABERTO") {
        return "Aberto";
    }
    if (v === "EM_ANDAMENTO" || v === "ANDAMENTO") {
        return "Em andamento";
    }
    if (v === "AGUARDANDO") {
        return "Aguardando";
    }
    if (v === "RESOLVIDO") {
        return "Resolvido";
    }
    if (v === "FECHADO") {
        return "Fechado";
    }
    if (v === "EM_ATRASO" || v === "EM-ATRASO") {
        return "Em atraso";
    }
    return valor || "—";
}

function cssStatus(valor) {
    const v = String(valor || "")
        .trim()
        .toUpperCase();
    if (v === "ABERTO") {
        return "aberto";
    }
    if (v === "EM_ANDAMENTO") {
        return "andamento";
    }
    if (v === "RESOLVIDO") {
        return "resolvido";
    }
    if (v === "FECHADO") {
        return "fechado";
    }
    if (v === "EM_ATRASO") {
        return "em_atraso";
    }
    return String(valor || "aberto")
        .trim()
        .toLowerCase();
}

function cssPrioridade(valor) {
    const v = String(valor || "")
        .trim()
        .toLowerCase();
    if (v === "média") {
        return "media";
    }
    if (v === "crítica") {
        return "critica";
    }
    return v || "baixa";
}
