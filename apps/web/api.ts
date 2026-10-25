import type { Task, Feedback, Memory, Skill } from '../../packages/learning/service.ts';
import type { Conversation } from '../server/chat.ts';
import type { Activity } from '../../packages/operations/activities.ts';
import type { ReportBatch } from '../../packages/operations/reports.ts';
import type { Forecast } from '../../packages/operations/forecast.ts';
import type { Inventory } from '../../packages/operations/inventory.ts';
import type { Pool, Allocation } from '../../packages/operations/allocation.ts';
import type { Shipment } from '../../packages/operations/shipping.ts';

export type Snapshot = {
  forecasts: Forecast[];
  inventories: Inventory[];
  pools: Pool[];
  allocations: Allocation[];
  shipments: Shipment[];
  activities: Activity[];
  reminders: {
    id: string;
    revision: number;
    title: string;
    dueAt: string;
    timeZone: string;
    read: boolean;
  }[];
  reports: ReportBatch[];
  tasks: Task[];
  feedback: Feedback[];
  memories: Memory[];
  skills: Skill[];
  sessions: Conversation[];
  jobs: { id: string; status: string; type: string }[];
  learningEnabled: boolean;
  summary: { summary: string; revision: number } | null;
};
export type Status = {
  syntheticModel?: boolean;
  modelState?: string;
  authenticated: boolean;
  live: boolean;
  scope: string;
  budget: {
    used: { calls: number; inputTokens: number; outputTokens: number };
    limits: { maxCalls: number; maxTotalTokens: number };
  };
};
export function modelLabel(status?: Status) {
  if (status?.syntheticModel) return '合成模型验收';
  const labels: Record<string, string> = {
    disabled: '模型未启用',
    budget_exhausted: '调用额度已用完',
    last_failed: '最近请求失败',
    last_succeeded: '最近请求成功',
    enabled_unverified: '模型调用已启用',
  };
  return labels[status?.modelState ?? ''] ?? (status?.live ? '模型调用已启用' : '模型未启用');
}
const errorLabels: Record<string, string> = {
  AUTH_REQUIRED: '请先登录工作台',
  LOGIN_FAILED: '密码不正确，请重试',
  LOGIN_RATE_LIMITED: '尝试次数较多，请稍后再登录',
  TIME_ZONE_REQUIRED: '请先填写站点时区',
  INVALID_TIME_ZONE: '请选择有效的站点时区',
  EXPLICIT_OFFSET_REQUIRED: '计划时间需包含 UTC 偏移，例如 2026-10-26T10:00:00-07:00',
  CHECKLIST_INCOMPLETE: '先完成清单中的检查项，再确认成功',
  REVISION_CONFLICT: '这条记录刚刚更新，请刷新后重试',
  SENSITIVE_INPUT_BLOCKED: '内容包含疑似凭据，请移除后再保存',
  MODEL_BUDGET_EXHAUSTED: '当前模型额度已用完',
  SESSION_BUSY: '助手仍在处理上一条消息',
  EXPORT_REDACTION_REQUIRED: '导出内容需要先移除敏感信息',
  SKILL_REVOKED_OR_UNAVAILABLE: '这条经验已停用或不再适用',
  INVALID_TASK: '请填写任务标题和至少一个检查项',
  SITE_TIME_MISMATCH: '时间偏移与站点时区不一致，请检查夏令时及当地时间',
  INVALID_ACTIVITY: '请检查活动起止时间、店铺和链接',
  MISSING_VALUE: '报表包含缺失值，请补齐，缺失不会按零处理',
  DUPLICATE_ROW: '报表含重复记录，请先核对',
  MISSING_COLUMN: '列映射不完整或重复，请检查规范列',
  INVALID_CSV: 'CSV格式不正确，请检查引号及每行列数',
  INVALID_DATE: '日期无效，请使用 YYYY-MM-DD',
  INVALID_NUMBER: '数量或金额无效，请检查负数和小数',
  INSUFFICIENT_SALES: '缺少截至日期连续7日销量，请补齐或明确填写人工日需求及原因',
  MANUAL_REASON_REQUIRED: '人工修正需填写原因，原始基线会保留',
  POOL_EXHAUSTED: '共享库存不足，已有分配不会重复计算',
  STORE_WINDOW_CLOSED: '发货日期不在该店铺可用时段',
  POOL_SKU_MISMATCH: '共享池与库存方案的实物SKU不一致',
  PREREQUISITES_REQUIRED: '请完成四项前置检查，并填写目的仓与负责人',
  DUAL_IDS_REQUIRED: '请先关联Amazon及ERP两个系统的单号',
  DUPLICATE_EXTERNAL_ID: '该系统单号已经关联另一发货记录',
  INVALID_RECEIPT: '累计到货不可倒退、超量或在发运前登记',
  PAST_INBOUND: '在途日期早于库存快照，请核实延误或实际到货',
};
export const errorMessage = (value: string) => errorLabels[value] ?? `操作未完成（${value}）`;
export async function api<T>(path: string, body?: object): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'content-type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const value = await response.json();
  if (!response.ok) throw new Error(errorMessage(value.error ?? 'REQUEST_FAILED'));
  return value as T;
}
export const requestId = () => crypto.randomUUID();
export function download(name: string, content: string, type = 'text/markdown') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const empty: Snapshot = {
  forecasts: [],
  inventories: [],
  pools: [],
  allocations: [],
  shipments: [],
  activities: [],
  reminders: [],
  reports: [],
  tasks: [],
  feedback: [],
  memories: [],
  skills: [],
  sessions: [],
  jobs: [],
  learningEnabled: true,
  summary: null,
};
