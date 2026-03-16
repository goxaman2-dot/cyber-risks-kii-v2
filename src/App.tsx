import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  Briefcase, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw,
  User,
  UserCheck,
  Info,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  Zap,
  Server,
  Network,
  Database,
  Search,
  Target,
  Skull,
  Bug,
  FileText,
  CreditCard,
  Mail,
  Globe,
  Building2,
  ShoppingCart,
  HardHat,
  Hotel,
  Layout,
  Monitor,
  Cpu,
  Cloud,
  Upload,
  Calendar,
  Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { QRCodeCanvas } from 'qrcode.react';

// --- Types & Constants ---

interface Sector {
  id: string;
  icon: React.ReactNode;
  name: string;
  sub: string;
  baseZ: number;
}

interface Factor {
  id: string;
  group: number;
  groupName: string;
  dim: string;
  name: string;
  wi: number;
  gi: number;
  wi_gi: number;
  dBefore: number;
  dAfter: number;
  budgetCost: number;
  budgetVendor: string;
  vipCost: number;
  vipVendor: string;
  quickWin: string;
  defaults: Record<string, number>;
  downtime: number; // Potential downtime in hours
}

const SECTORS: Sector[] = [
  { id: 'trade', icon: <Briefcase className="w-6 h-6" />, name: 'Розничная торговля (47)', sub: 'Фишинг, кража карт, POS', baseZ: 5.8 },
  { id: 'ecommerce', icon: <ShoppingCart className="w-6 h-6" />, name: 'Интернет-торговля (47.91)', sub: 'Маркетплейсы, API, веб-атаки', baseZ: 6.0 },
  { id: 'services', icon: <Users className="w-6 h-6" />, name: 'Проф. услуги и консалтинг (M)', sub: 'Утечка данных клиентов', baseZ: 5.5 },
  { id: 'it', icon: <Zap className="w-6 h-6" />, name: 'ИТ и разработка ПО (62)', sub: 'Supply chain, IAM, AppSec', baseZ: 5.9 },
  { id: 'production', icon: <Building2 className="w-6 h-6" />, name: 'Производство (C)', sub: 'Промышленный шпионаж, АСУ ТП', baseZ: 5.7 },
  { id: 'health', icon: <ShieldCheck className="w-6 h-6" />, name: 'Медицина (Q)', sub: 'Ransomware, медданные', baseZ: 6.2 },
  { id: 'edu', icon: <Info className="w-6 h-6" />, name: 'Образование (P)', sub: 'DDoS, несанкц. доступ', baseZ: 4.8 },
  { id: 'logistics', icon: <TrendingUp className="w-6 h-6" />, name: 'Транспорт и логистика (H)', sub: 'Трекинг, GPS-спуфинг', baseZ: 5.2 },
  { id: 'agro', icon: <Globe className="w-6 h-6" />, name: 'Сельское хозяйство (A)', sub: 'Логистика, сезонные риски', baseZ: 4.6 },
  { id: 'food', icon: <ShieldAlert className="w-6 h-6" />, name: 'Общепит и HoReCa (I)', sub: 'Кража данных карт POS', baseZ: 4.5 },
  { id: 'construct', icon: <Server className="w-6 h-6" />, name: 'Строительство (F)', sub: 'Инсайдеры, тендерные данные', baseZ: 5.0 },
  { id: 'hotel', icon: <Hotel className="w-6 h-6" />, name: 'Гостиничный бизнес (55)', sub: 'Бронирование, ПДн гостей', baseZ: 5.4 },
  { id: 'realestate', icon: <Layout className="w-6 h-6" />, name: 'Недвижимость (L)', sub: 'Сделки, реестры, ПДн', baseZ: 5.1 },
  { id: 'mining', icon: <HardHat className="w-6 h-6" />, name: 'Добыча и ресурсы (B)', sub: 'АСУ ТП, экология, безопасность', baseZ: 6.5 },
];

const METHODOLOGY_FILES = [
  { 
    name: 'risk_engine.ts', 
    desc: 'Ядро интегрального показателя R_SME',
    content: `// Формула расчета итогового риска
function calculateRSME(Z_after, Z_before) {
  // R_SME = (Z_after / Z_before) * Коэффициент_отрасли
  // Учитывает остаточный риск после внедрения мер
  return (Z_after / Z_before) * 0.85;
}`,
    icon: <Cpu className="w-4 h-4" />
  },
  { 
    name: 'pareto_analysis.ts', 
    desc: 'Алгоритм выделения 16 доминирующих факторов',
    content: `// Анализ Парето для угроз ИБ
// 1. Сортировка факторов по весу (wi * gi)
// 2. Отбор топ-16, формирующих 80% риска
const TOP_FACTORS_COUNT = 16;
const paretoThreshold = 0.8;`,
    icon: <Target className="w-4 h-4" />
  },
  { 
    name: 'cost_benefit.ts', 
    desc: 'Модель оценки эффективности затрат на ИБ',
    content: `// Оценка эффективности затрат на меры защиты
// Сравнение предотвращенного ущерба и стоимости внедрения
// Помогает оптимизировать бюджет на ИБ`,
    icon: <CreditCard className="w-4 h-4" />
  },
  { 
    name: 'threat_matrix.ts', 
    desc: 'База данных вероятностей NIST/ФСТЭК',
    content: `// Матрица вероятностей (Likelihood)
// Основана на статистике инцидентов 2024-2025
const threatMatrix = {
  'phishing': 0.75,
  'ransomware': 0.45,
  'insider': 0.30
};`,
    icon: <Network className="w-4 h-4" />
  }
];

const FACTORS: Factor[] = [
  {
    id: '1.1', group: 1, groupName: 'Конфиденциальность', dim: 'C',
    name: 'MFA и шифрование данных', wi: 8, gi: 13, wi_gi: 1.04,
    dBefore: 5, dAfter: 2,
    budgetCost: 0, budgetVendor: 'Google Authenticator / Яндекс Ключ + OpenVPN / WireGuard',
    vipCost: 12000, vipVendor: 'Secret Net Studio (Код Безопасности) · ~12 000 ₽/раб.место',
    quickWin: 'Включить MFA на VPN и RDP прямо сейчас — 0 ₽, 30 минут настройки.',
    defaults: { trade: 5, services: 4, it: 4, health: 5, edu: 4, logistics: 4, food: 4, construct: 4, production: 5, agro: 3, ecommerce: 6 },
    downtime: 24,
  },
  {
    id: '1.2', group: 1, groupName: 'Конфиденциальность', dim: 'C',
    name: 'Обучение сотрудников — антифишинг', wi: 11, gi: 13, wi_gi: 1.43,
    dBefore: 6, dAfter: 3,
    budgetCost: 0, budgetVendor: 'DIY / DMARC (DNS) + тестовые рассылки вручную',
    vipCost: 150000, vipVendor: 'Kaspersky ASAP / Phishman — ~3 000 ₽/юзер/год',
    quickWin: 'Настроить DMARC p=quarantine + провести один тестовый фишинг внутри.',
    defaults: { trade: 5, services: 5, it: 4, health: 5, edu: 4, logistics: 4, food: 4, construct: 4, production: 5, agro: 3, ecommerce: 6 },
    downtime: 12,
  },
  {
    id: '1.3', group: 1, groupName: 'Конфиденциальность', dim: 'C',
    name: 'Управление ключами и секретами', wi: 6, gi: 13, wi_gi: 0.78,
    dBefore: 4, dAfter: 4,
    budgetCost: 5000, budgetVendor: 'HashiCorp Vault OSS / Yandex KMS < 1 000 ₽/мес',
    vipCost: 1500000, vipVendor: 'КриптоПро HSM / Рутокен ЭЦП 3.0',
    quickWin: 'Убрать пароли из кода и Git (TruffleHog scan).',
    defaults: { trade: 3, services: 4, it: 5, health: 3, edu: 3, logistics: 3, food: 2, construct: 3, production: 4, agro: 2, ecommerce: 6 },
    downtime: 48,
  },
  {
    id: '1.4', group: 1, groupName: 'Конфиденциальность', dim: 'C',
    name: 'DLP — Защита от утечек данных', wi: 12, gi: 13, wi_gi: 1.56,
    dBefore: 7, dAfter: 3,
    budgetCost: 50000, budgetVendor: 'StaffCop / SearchInform (Lite)',
    vipCost: 1200000, vipVendor: 'InfoWatch Traffic Monitor / Solar Dozor',
    quickWin: 'Запретить USB-накопители через GPO.',
    defaults: { trade: 6, services: 5, it: 4, health: 7, edu: 4, logistics: 5, food: 3, construct: 5, production: 6, agro: 4, ecommerce: 5 },
    downtime: 72,
  },
  {
    id: '1.5', group: 1, groupName: 'Конфиденциальность', dim: 'C',
    name: 'PAM — Контроль привилегий', wi: 9, gi: 13, wi_gi: 1.17,
    dBefore: 5, dAfter: 2,
    budgetCost: 0, budgetVendor: 'Apache Guacamole + MFA',
    vipCost: 1800000, vipVendor: 'Indeed PAM / СКДПУ (АйТи Бастион)',
    quickWin: 'Запретить вход под учёткой Administrator по RDP.',
    defaults: { trade: 4, services: 4, it: 6, health: 4, edu: 3, logistics: 4, food: 2, construct: 4, production: 5, agro: 3, ecommerce: 6 },
    downtime: 36,
  },
  {
    id: '1.6', group: 1, groupName: 'Конфиденциальность', dim: 'C',
    name: 'IdM/IAM — Управление доступом', wi: 7, gi: 13, wi_gi: 0.91,
    dBefore: 5, dAfter: 3,
    budgetCost: 0, budgetVendor: 'Keycloak (Open Source) / FreeIPA',
    vipCost: 2500000, vipVendor: 'Avanpost IDM / Solar IdM',
    quickWin: 'Провести ревизию уволенных сотрудников в AD/Почте.',
    defaults: { trade: 4, services: 5, it: 6, health: 4, edu: 4, logistics: 4, food: 3, construct: 4, production: 5, agro: 3, ecommerce: 6 },
    downtime: 24,
  },
  {
    id: '2.2', group: 2, groupName: 'Целостность', dim: 'I',
    name: 'Контроль конфигураций (Config Drift)', wi: 7, gi: 14, wi_gi: 0.98,
    dBefore: 5, dAfter: 3,
    budgetCost: 0, budgetVendor: 'GitOps (GitLab + Ansible/Terraform) / Wazuh FIM',
    vipCost: 1500000, vipVendor: 'Efros Config Inspector (Газинформсервис)',
    quickWin: 'Включить FIM Wazuh на /etc/ или System32.',
    defaults: { trade: 3, services: 4, it: 5, health: 3, edu: 3, logistics: 3, food: 2, construct: 4, production: 6, agro: 3, ecommerce: 5 },
    downtime: 18,
  },
  {
    id: '2.3', group: 2, groupName: 'Целостность', dim: 'I',
    name: 'Управление уязвимостями (Patching)', wi: 9, gi: 14, wi_gi: 1.26,
    dBefore: 6, dAfter: 2,
    budgetCost: 0, budgetVendor: 'OpenVAS (Greenbone) + WSUS / Unattended Upgrades',
    vipCost: 400000, vipVendor: 'RedCheck (Алтэкс-Софт) / MaxPatrol VM',
    quickWin: 'Включить автообновление браузеров и ОС прямо сейчас — 0 ₽.',
    defaults: { trade: 4, services: 4, it: 5, health: 4, edu: 3, logistics: 4, food: 3, construct: 4, production: 5, agro: 3, ecommerce: 6 },
    downtime: 12,
  },
  {
    id: '3.2', group: 3, groupName: 'Доступность', dim: 'A',
    name: 'Резервное копирование и DR', wi: 10, gi: 15, wi_gi: 1.50,
    dBefore: 6, dAfter: 1,
    budgetCost: 15000, budgetVendor: 'Handy Backup (Новософт) / облачные снимки — ~15 000 ₽/сервер',
    vipCost: 150000, vipVendor: 'Кибер Бэкап (Киберпротект) — макс. снижение риска',
    quickWin: 'Проверить правило 3-2-1 (одна копия — в облаке). Облако ~500 ₽/мес.',
    defaults: { trade: 4, services: 4, it: 4, health: 5, edu: 4, logistics: 5, food: 4, construct: 4, production: 6, agro: 5, ecommerce: 6 },
    downtime: 168,
  },
  {
    id: '3.3', group: 3, groupName: 'Доступность', dim: 'A',
    name: 'Защита от DDoS-атак', wi: 9, gi: 15, wi_gi: 1.35,
    dBefore: 5, dAfter: 2,
    budgetCost: 10000, budgetVendor: 'DDoS-Guard / StormWall (Базовый)',
    vipCost: 300000, vipVendor: 'Kaspersky DDoS Protection / Qrator',
    quickWin: 'Скрыть реальные IP серверов за Cloudflare/Proxy.',
    defaults: { trade: 6, services: 4, it: 7, health: 4, edu: 5, logistics: 4, food: 6, construct: 3, production: 4, agro: 3, ecommerce: 8 },
    downtime: 24,
  },
  {
    id: '4.3', group: 4, groupName: 'Архитектура', dim: 'Ac',
    name: 'SIEM / Обнаружение угроз (MTTD)', wi: 10, gi: 58, wi_gi: 5.80,
    dBefore: 6, dAfter: 4,
    budgetCost: 0, budgetVendor: 'Wazuh / ELK Stack (Open Source)',
    vipCost: 1000000, vipVendor: 'Solar JSOC / Jet CSOC / BI.ZONE MDR — 3 млн ₽/год',
    quickWin: 'Включить расширенный аудит Windows (Process Creation).',
    defaults: { trade: 4, services: 4, it: 5, health: 5, edu: 3, logistics: 4, food: 3, construct: 4, production: 5, agro: 3, ecommerce: 6 },
    downtime: 120,
  },
  {
    id: '4.4', group: 4, groupName: 'Архитектура', dim: 'Ad',
    name: 'Сегментация сети (VLAN / NGFW)', wi: 6, gi: 58, wi_gi: 3.48,
    dBefore: 5, dAfter: 4,
    budgetCost: 0, budgetVendor: 'VLAN + ACL + Windows Defender Firewall GPO',
    vipCost: 800000, vipVendor: 'UserGate NGFW / InfoWatch Traffic Monitor',
    quickWin: 'Изолировать принтеры и IoT в "грязный" VLAN.',
    defaults: { trade: 3, services: 3, it: 4, health: 4, edu: 3, logistics: 4, food: 3, construct: 4, production: 7, agro: 4, ecommerce: 5 },
    downtime: 48,
  },
  {
    id: '4.5', group: 4, groupName: 'Архитектура', dim: 'Aw',
    name: 'WAF — Защита веб-ресурсов', wi: 8, gi: 58, wi_gi: 4.64,
    dBefore: 6, dAfter: 2,
    budgetCost: 20000, budgetVendor: 'Cloudflare WAF (Free/Pro) / Wallarm (SaaS)',
    vipCost: 900000, vipVendor: 'PT Application Firewall / SolidWall WAF',
    quickWin: 'Включить базовые правила OWASP в Nginx.',
    defaults: { trade: 6, services: 4, it: 7, health: 4, edu: 3, logistics: 4, food: 5, construct: 3, production: 3, agro: 2, ecommerce: 9 },
    downtime: 24,
  },
  {
    id: '4.6', group: 4, groupName: 'Архитектура', dim: 'Ae',
    name: 'EDR — Защита хостов', wi: 11, gi: 58, wi_gi: 6.38,
    dBefore: 6, dAfter: 2,
    budgetCost: 0, budgetVendor: 'Wazuh EDR / Sysmon + ELK',
    vipCost: 600000, vipVendor: 'Kaspersky EDR / Positive Technologies MaxPatrol EDR',
    quickWin: 'Настроить блокировку запуска исполняемых файлов из Temp.',
    defaults: { trade: 5, services: 5, it: 6, health: 6, edu: 4, logistics: 5, food: 4, construct: 5, production: 6, agro: 4, ecommerce: 7 },
    downtime: 36,
  },
  {
    id: '5.1', group: 5, groupName: 'Процессы', dim: 'P',
    name: 'Аудит ИБ и комплаенс', wi: 8, gi: 20, wi_gi: 1.60,
    dBefore: 7, dAfter: 4,
    budgetCost: 0, budgetVendor: 'Внутренний чек-лист по 152-ФЗ / 187-ФЗ',
    vipCost: 500000, vipVendor: 'Внешний аудит (Big 4 / ГК Солар / Информзащита)',
    quickWin: 'Разработать Политику обработки ПДн.',
    defaults: { trade: 5, services: 6, it: 5, health: 8, edu: 7, logistics: 5, food: 4, construct: 5, production: 6, agro: 5, ecommerce: 6 },
    downtime: 12,
  },
  {
    id: '5.2', group: 5, groupName: 'Процессы', dim: 'P',
    name: 'Физическая безопасность и СКУД', wi: 6, gi: 20, wi_gi: 1.20,
    dBefore: 4, dAfter: 2,
    budgetCost: 0, budgetVendor: 'Журнал посещений + обычные замки',
    vipCost: 400000, vipVendor: 'Sigur / Parsec + Видеонаблюдение с аналитикой',
    quickWin: 'Закрыть серверную на ключ и ограничить вход.',
    defaults: { trade: 4, services: 3, it: 4, health: 5, edu: 6, logistics: 6, food: 4, construct: 7, production: 8, agro: 7, ecommerce: 3 },
    downtime: 8,
  },
];

const SPECIALISTS = [
  { 
    id: 'none', 
    label: 'Нет ИБ', 
    nick: 'Призрак',
    desc: 'Риски на максимуме',
    salary: 0,
    icon: <User className="w-10 h-10 opacity-20" />
  },
  { 
    id: '75k', 
    label: '75к оклад', 
    nick: 'Пионер',
    desc: 'Базовая гигиена ИБ',
    salary: 75000,
    icon: <Search className="w-10 h-10" />
  },
  { 
    id: '100k', 
    label: '100к оклад', 
    nick: 'Страж',
    desc: 'Контроль периметра',
    salary: 100000,
    icon: <Shield className="w-10 h-10" />
  },
  { 
    id: '125k', 
    label: '125к оклад', 
    nick: 'Рентген',
    desc: 'Видит всё насквозь',
    salary: 125000,
    icon: <Eye className="w-10 h-10" />
  },
];

const PROTECTION_OBJECTS = [
  { id: '1c_acc', label: '1С:Бухгалтерия', icon: <CreditCard className="w-5 h-5" />, category: 'Финансы' },
  { id: '1c_hr', label: '1С:ЗУП (Кадры)', icon: <Users className="w-5 h-5" />, category: 'HR / ПДн' },
  { id: '1c_doc', label: '1С:Документооборот', icon: <FileText className="w-5 h-5" />, category: 'Документы' },
  { id: 'crm', label: 'CRM (Битрикс / Amo)', icon: <Layout className="w-5 h-5" />, category: 'Продажи / CRM' },
  { id: '1c_trade', label: '1С:Управление торговлей', icon: <ShoppingCart className="w-5 h-5" />, category: 'Склад / Логистика' },
  { id: '1c_smeta', label: '1С:Смета / Проекты', icon: <HardHat className="w-5 h-5" />, category: 'Производство' },
  { id: 'asu_tp', label: 'АСУ ТП / Контроллеры', icon: <Cpu className="w-5 h-5" />, category: 'Производство' },
  { id: 'scada', label: 'SCADA-системы', icon: <Zap className="w-5 h-5" />, category: 'Энергетика / Пром' },
  { id: 'autocad', label: 'AutoCAD / Дизайн', icon: <Cpu className="w-5 h-5" />, category: 'Интеллект. собств.' },
  { id: '1c_hotel', label: '1С:Отель / Брони', icon: <Hotel className="w-5 h-5" />, category: 'Гостеприимство' },
  { id: 'client_db', label: 'База клиентов (SQL)', icon: <Database className="w-5 h-5" />, category: 'Комм. тайна' },
  { id: 'bank', label: 'Банк-Клиент', icon: <ShieldCheck className="w-5 h-5" />, category: 'Денежные потоки' },
  { id: 'email', label: 'Корп. почта / Slack', icon: <Mail className="w-5 h-5" />, category: 'Коммуникации' },
  { id: 'telecom', label: 'АТС / Связь', icon: <Network className="w-5 h-5" />, category: 'Коммуникации' },
  { id: 'network', label: 'Сетевой периметр', icon: <Network className="w-5 h-5" />, category: 'ИТКС' },
  { id: 'cloud_infra', label: 'Облачная инфраструктура', icon: <Cloud className="w-5 h-5" />, category: 'ИТКС' },
  { id: 'website', label: 'Сайт / Личный кабинет', icon: <Globe className="w-5 h-5" />, category: 'Web-активы' },
  { id: 'eshop', label: 'Интернет-магазин', icon: <ShoppingCart className="w-5 h-5" />, category: 'Web-активы' },
  { id: 'freelancers', label: 'Самозанятые вне штата', icon: <UserCheck className="w-5 h-5" />, category: 'HR / ПДн' },
  { id: 'gis', label: 'Гос. информ. системы (ГИС)', icon: <Shield className="w-5 h-5" />, category: 'КИИ / Госсектор' },
  { id: 'life_support', label: 'Системы жизнеобеспечения', icon: <Zap className="w-5 h-5" />, category: 'КИИ / Инфраструктура' },
  { id: 'backup_server', label: 'Серверы бэкапа (Offline)', icon: <Database className="w-5 h-5" />, category: 'КИИ / Резерв' },
];

const ARCHITECTURE_TYPES = [
  { 
    id: 'local', 
    label: 'Локальная', 
    desc: 'Один офис, свои серверы', 
    icon: <Server className="w-5 h-5" />, 
    multiplier: 1.0,
    hint: 'У вас есть серверная комната или шкаф в офисе. Все данные хранятся на ваших дисках.',
    check: ['Собственные серверы', 'Локальная сеть (LAN)', 'Нет зависимости от интернета для работы БД']
  },
  { 
    id: 'cloud', 
    label: 'Облачная', 
    desc: 'SaaS, облачные серверы', 
    icon: <Cloud className="w-5 h-5" />, 
    multiplier: 1.1,
    hint: 'У вас нет физических серверов. Вы используете Yandex Cloud, AWS или готовые сервисы (SaaS).',
    check: ['Работа через браузер', 'Нет серверной в офисе', 'Данные у провайдера']
  },
  { 
    id: 'hybrid', 
    label: 'Гибридная', 
    desc: 'Офис + Облако', 
    icon: <Network className="w-5 h-5" />, 
    multiplier: 1.2,
    hint: 'Часть данных в офисе (например, 1С), а часть в облаке (почта, CRM).',
    check: ['Связь офис-облако (VPN)', 'Свои серверы + SaaS', 'Сложная маршрутизация']
  },
  { 
    id: 'dist', 
    label: 'Распределенная', 
    desc: 'Сеть филиалов / удаленка', 
    icon: <Globe className="w-5 h-5" />, 
    multiplier: 1.4,
    hint: 'Много офисов или сотрудники работают из дома по всей стране.',
    check: ['Много точек входа', 'Удаленные рабочие места', 'VPN-каналы между городами']
  },
  { 
    id: 'industrial', 
    label: 'Промышленная', 
    desc: 'Цех, АСУ ТП, спец. железо', 
    icon: <Cpu className="w-5 h-5" />, 
    multiplier: 1.5,
    hint: 'Есть производственные линии, станки с ЧПУ или контроллеры.',
    check: ['Технологическая сеть', 'Станки и датчики', 'Изолированные сегменты']
  },
];

const ArchitectureDiagram = ({ type }: { type: string }) => {
  const variants = {
    local: (
      <svg viewBox="0 0 200 120" className="w-full h-32">
        <rect x="70" y="40" width="60" height="40" rx="4" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2" />
        <rect x="80" y="50" width="40" height="4" rx="1" fill="#3b82f6" />
        <rect x="80" y="60" width="40" height="4" rx="1" fill="#3b82f6" />
        <rect x="80" y="70" width="40" height="4" rx="1" fill="#3b82f6" />
        <circle cx="100" cy="100" r="10" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
        <line x1="100" y1="80" x2="100" y2="90" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    ),
    cloud: (
      <svg viewBox="0 0 200 120" className="w-full h-32">
        <path d="M150,70 a30,30 0 0,0 -60,0 a40,40 0 1,0 -40,40 h100 a30,30 0 0,0 0,-40" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2" />
        <circle cx="100" cy="75" r="5" fill="#3b82f6" />
        <line x1="100" y1="80" x2="100" y2="100" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    ),
    hybrid: (
      <svg viewBox="0 0 200 120" className="w-full h-32">
        <rect x="40" y="60" width="40" height="30" rx="2" fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeWidth="1" />
        <path d="M160,50 a20,20 0 0,0 -40,0 a30,30 0 1,0 -30,30 h70 a20,20 0 0,0 0,-30" fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeWidth="1" />
        <path d="M80,75 L110,65" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />
      </svg>
    ),
    dist: (
      <svg viewBox="0 0 200 120" className="w-full h-32">
        <circle cx="100" cy="60" r="40" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="100" cy="60" r="10" fill="#3b82f6" fillOpacity="0.2" />
        <circle cx="60" cy="40" r="5" fill="#3b82f6" />
        <circle cx="140" cy="40" r="5" fill="#3b82f6" />
        <circle cx="60" cy="80" r="5" fill="#3b82f6" />
        <circle cx="140" cy="80" r="5" fill="#3b82f6" />
      </svg>
    ),
    industrial: (
      <svg viewBox="0 0 200 120" className="w-full h-32">
        <rect x="50" y="40" width="100" height="50" rx="4" fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeWidth="1" />
        <path d="M60,80 L60,60 L80,60 L80,80" fill="none" stroke="#3b82f6" strokeWidth="2" />
        <path d="M100,80 L100,60 L120,60 L120,80" fill="none" stroke="#3b82f6" strokeWidth="2" />
        <circle cx="70" cy="50" r="3" fill="#ef4444" />
        <circle cx="110" cy="50" r="3" fill="#ef4444" />
      </svg>
    )
  };
  return variants[type as keyof typeof variants] || null;
};

const BUDGET_TIERS = [
  { label: '0 ₽', val: 0 },
  { label: '50 000 ₽', val: 50000 },
  { label: '100 000 ₽', val: 100000 },
  { label: '200 000 ₽', val: 200000 },
  { label: '★ 660 000 ₽', val: 660000, opt: true },
  { label: '1 000 000 ₽', val: 1000000 },
];

// --- Helper Components ---

const Gauge = ({ value, label, color = '#10b981', subLabel }: { value: number; label: string; color?: string; subLabel?: string }) => {
  const radius = 80;
  const strokeWidth = 12;
  const normalizedValue = Math.min(Math.max(value, 1), 10);
  const percentage = (normalizedValue - 1) / 9;
  const angle = percentage * 180 - 180; // -180 to 0 degrees for semi-circle

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-28 overflow-hidden">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          {/* Background Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#161b25"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${percentage * 251.3} 251.3`}
            className="transition-all duration-1000 ease-out"
          />
          {/* Needle */}
          <g transform={`rotate(${angle + 90}, 100, 100)`} className="transition-all duration-1000 ease-out">
            <line x1="100" y1="100" x2="100" y2="30" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="100" cy="100" r="4" fill="white" />
          </g>
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <div className="text-2xl font-heading font-bold" style={{ color }}>{value.toFixed(1)}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#62708a] font-bold">{label}</div>
        </div>
      </div>
      {subLabel && <div className="text-[10px] text-[#2e3a50] mt-1 font-bold uppercase">{subLabel}</div>}
    </div>
  );
};

const LogoSKFU = () => (
  <img 
    src="https://www.ncfu.ru/export/sites/ncfu/.galleries/images/logo-ncfu.png" 
    alt="СКФУ" 
    className="h-16 w-auto object-contain"
    referrerPolicy="no-referrer"
  />
);

const LogoOTZI = () => (
  <img 
    src="https://otzi.ncfu.ru/templates/otzi/images/logo.png" 
    alt="ОТЗИ" 
    className="h-16 w-auto object-contain"
    referrerPolicy="no-referrer"
  />
);

// --- Main App Component ---

export default function App() {
  const [step, setStep] = useState(1);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>('none');
  const [selectedMethodFile, setSelectedMethodFile] = useState<typeof METHODOLOGY_FILES[0] | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [selectedArchitecture, setSelectedArchitecture] = useState<string>('local');
  const [showArchHelp, setShowArchHelp] = useState(false);
  const [customFactors, setCustomFactors] = useState<Factor[]>(FACTORS);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [vendorFileName, setVendorFileName] = useState<string | null>(null);
  const [paretoFileName, setParetoFileName] = useState<string | null>(null);
  const [excelDowntimeBefore, setExcelDowntimeBefore] = useState<number | null>(null);
  const [excelDowntimeAfter, setExcelDowntimeAfter] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [tierSelected, setTierSelected] = useState<Record<string, 'budget' | 'vip' | null>>({});
  const [budget, setBudget] = useState(660000);
  const [results, setResults] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'landscape' | 'architecture'>('landscape');
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [revenueRange, setRevenueRange] = useState<'1-4' | '4-10' | '10+' | null>(null);
  const [competitorRange, setCompetitorRange] = useState<'1-2' | '3-10' | '11+' | null>(null);
  const [marketType, setMarketType] = useState<'duopoly' | 'oligopoly' | 'perfect' | null>(null);
  const [highConcentration, setHighConcentration] = useState<boolean>(false);

  // Auto-assign market type based on competitors and concentration
  useEffect(() => {
    if (competitorRange === '1-2') {
      setMarketType(highConcentration ? 'duopoly' : 'oligopoly');
    } else if (competitorRange === '3-10') {
      setMarketType('oligopoly');
      setHighConcentration(false);
    } else if (competitorRange === '11+') {
      setMarketType('perfect');
      setHighConcentration(false);
    }
  }, [competitorRange, highConcentration]);

  const currentRSME = useMemo(() => {
    const W_TOTAL = customFactors.reduce((a, f) => a + f.wi_gi, 0);
    const Z_after_raw = customFactors.reduce((a, f) => {
      const tier = tierSelected[f.id];
      let score = scores[f.id] || f.dBefore;
      if (tier) {
        const reduction = tier === 'vip' ? (score - f.dAfter) * 0.85 : (score - f.dAfter) * 0.70;
        score = Math.max(1, score - reduction);
      }
      return a + f.wi_gi * score;
    }, 0) / W_TOTAL;

    const specImpactMap: Record<string, number> = { 'none': 0, '75k': 0.10, '100k': 0.15, '125k': 0.25 };
    const specImpact = specImpactMap[selectedSpecialist] || 0;
    
    let objectPenalty = 1;
    if (selectedObjects.length > 4) objectPenalty = 1.15;
    if (selectedObjects.length === PROTECTION_OBJECTS.length) objectPenalty = 1.30;

    const Z_after = Z_after_raw * (1 - specImpact) * objectPenalty;
    return Math.min(1, Math.max(0, (Z_after - 1) / 9));
  }, [customFactors, scores, tierSelected, selectedSpecialist, selectedObjects]);

  const getRelevantFactors = (objId: string, category: string, allFactors: Factor[]) => {
    // Logic to filter factors based on object type
    if (category.includes('КИИ / Инфраструктура') || objId === 'asu_tp' || objId === 'scada') {
      return allFactors.filter(f => f.group === 3 || f.id === '4.4' || f.id === '4.6');
    }
    if (category.includes('КИИ / Резерв')) {
      return allFactors.filter(f => f.id === '3.2' || f.id === '2.2' || f.id === '1.5');
    }
    if (category.includes('КИИ / Госсектор')) {
      return allFactors.filter(f => f.group === 1 || f.group === 2 || f.id === '5.1');
    }
    if (category.includes('Web-активы')) {
      return allFactors.filter(f => f.id === '4.5' || f.id === '3.3' || f.id === '2.3');
    }
    if (category.includes('Финансы')) {
      return allFactors.filter(f => f.id === '1.1' || f.id === '1.3' || f.id === '2.3' || f.id === '3.2');
    }
    if (category.includes('HR / ПДн')) {
      return allFactors.filter(f => f.id === '1.4' || f.id === '1.6' || f.id === '5.1');
    }
    // Default: show a balanced subset if not specified
    return allFactors.filter((_, i) => i % 2 === 0);
  };

  const easeOfPenetration = useMemo(() => {
    // Ease of penetration is influenced by Architecture (4.4) and Specialist (5.1)
    const archScore = scores['4.4'] || 5;
    const specScore = scores['5.1'] || 5;
    const baseEase = currentRSME * 8;
    const penalty = (archScore + specScore) / 4; // Higher protection scores reduce ease
    return Math.min(10, Math.max(1, baseEase + 10 - penalty));
  }, [currentRSME, scores]);

  const topDangerousThreats = useMemo(() => {
    return [...customFactors]
      .sort((a, b) => {
        const riskA = (a.wi_gi * (scores[a.id] || a.dBefore));
        const riskB = (b.wi_gi * (scores[b.id] || b.dBefore));
        return riskB - riskA;
      })
      .slice(0, 3);
  }, [customFactors, scores]);

  const vendorCount = useMemo(() => {
    const vendors = new Set<string>();
    customFactors.forEach(f => {
      [f.budgetVendor, f.vipVendor].forEach(vStr => {
        if (!vStr) return;
        const parts = vStr.split(/[/+·,—()]/).map(p => p.trim());
        parts.forEach(p => {
          const clean = p.split('~')[0].split('<')[0].trim();
          if (clean.length > 2 && 
              !['DIY', 'DMARC', 'DNS', 'GitOps', 'VLAN', 'ACL', 'GPO', 'Open Source', 'облачные снимки', 'тестовые рассылки', 'вручную', 'один тестовый фишинг', 'пароли из кода', 'автообновление', 'браузеров', 'правило 3-2-1', 'облако', 'расширенный аудит', 'изолировать принтеры'].some(g => clean.toLowerCase().includes(g.toLowerCase()))) {
            vendors.add(clean);
          }
        });
      });
    });
    return vendors.size;
  }, []);

  const toggleObject = (id: string) => {
    setSelectedObjects(prev => 
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      
      // Try to find "Пересчет рисков" sheet or use the first one
      const riskSheetName = wb.SheetNames.find(n => n.includes('Пересчет рисков')) || wb.SheetNames[0];
      const ws = wb.Sheets[riskSheetName];
      
      // Extract K18 and K19 if they exist
      if (ws['K18']) setExcelDowntimeBefore(Number(ws['K18'].v));
      if (ws['K19']) setExcelDowntimeAfter(Number(ws['K19'].v));

      const data = XLSX.utils.sheet_to_json(ws) as any[];

      if (data.length > 0) {
        const newFactors = data.map((row, idx) => {
          const wi = Number(row.wi || row['Вес'] || 5);
          const gi = Number(row.gi || row['Значимость'] || 10);
          return {
            id: row.id || `custom-${idx}`,
            group: Number(row.group || 1),
            groupName: row.groupName || 'Пользовательские',
            dim: row.dim || 'C',
            name: row.name || row['Название'] || 'Без названия',
            wi,
            gi,
            wi_gi: row.wi_gi ? Number(row.wi_gi) : (wi * gi) / 100,
            dBefore: Number(row.dBefore || row['Ущерб до'] || 5),
            dAfter: Number(row.dAfter || row['Ущерб после'] || 2),
            budgetCost: Number(row.budgetCost || row['Бюджет цена'] || 0),
            budgetVendor: row.budgetVendor || row['Бюджет вендор'] || 'Стандартное решение',
            vipCost: Number(row.vipCost || row['VIP цена'] || 100000),
            vipVendor: row.vipVendor || row['VIP вендор'] || 'Премиум решение',
            quickWin: row.quickWin || row['Быстрая мера'] || 'Быстрая мера',
            downtime: Number(row.downtime || row['Простой'] || 24),
            defaults: row.defaults ? (typeof row.defaults === 'string' ? JSON.parse(row.defaults) : row.defaults) : FACTORS[0].defaults
          };
        });
        setCustomFactors(newFactors);
        alert(`Успешно загружено ${newFactors.length} показателей!`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleVendorUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVendorFileName(file.name);
  };

  const handleParetoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setParetoFileName(file.name);
  };

  // Auto-adjust specialist and budget based on protection objects
  useEffect(() => {
    const count = selectedObjects.length;
    const maxCount = PROTECTION_OBJECTS.length;

    if (count > 4) {
      if (selectedSpecialist === 'none') {
        setSelectedSpecialist('75k');
      }
      if (budget < 200000) {
        setBudget(200000);
      }
    }

    if (count === maxCount) {
      if (selectedSpecialist === 'none' || selectedSpecialist === '75k') {
        setSelectedSpecialist('100k');
      }
    }
  }, [selectedObjects, selectedSpecialist, budget]);

  // Initialize scores when sector changes or custom factors are loaded
  useEffect(() => {
    if (selectedSector) {
      const newScores: Record<string, number> = {};
      customFactors.forEach(f => {
        newScores[f.id] = f.defaults[selectedSector] || f.dBefore || 5;
      });
      setScores(newScores);
    }
  }, [selectedSector, customFactors]);

  // Auto-select measures based on budget
  useEffect(() => {
    const newTiers: Record<string, 'budget' | 'vip' | null> = {};
    customFactors.forEach(f => {
      if (f.budgetCost === 0) newTiers[f.id] = 'budget';
    });
    
    // Specific logic for default factors (if they still exist)
    const hasFactor = (id: string) => customFactors.some(f => f.id === id);
    
    if (budget >= 15000 && hasFactor('3.2')) newTiers['3.2'] = 'budget';
    if (budget >= 50000 && hasFactor('1.3')) newTiers['1.3'] = 'budget';
    if (budget >= 150000 && hasFactor('3.2')) newTiers['3.2'] = 'vip';
    if (budget >= 660000 && hasFactor('1.1')) newTiers['1.1'] = 'vip';
    
    setTierSelected(newTiers);
  }, [budget, customFactors]);

  const handleScoreChange = (id: string, val: number) => {
    setScores(prev => ({ ...prev, [id]: val }));
  };

  const getSpecialistByThreat = (val: number) => {
    if (val <= 3) return SPECIALISTS[0];
    if (val <= 5) return SPECIALISTS[1];
    if (val <= 8) return SPECIALISTS[2];
    return SPECIALISTS[3];
  };

  const calculate = () => {
    const W_TOTAL = customFactors.reduce((a, f) => a + f.wi_gi, 0);
    
    const Z_before = customFactors.reduce((a, f) => a + f.wi_gi * (scores[f.id] || f.dBefore), 0) / W_TOTAL;
    
    const Z_after_raw = customFactors.reduce((a, f) => {
      const tier = tierSelected[f.id];
      let score = scores[f.id] || f.dBefore;
      if (tier) {
        const reduction = tier === 'vip' ? (score - f.dAfter) * 0.85 : (score - f.dAfter) * 0.70;
        score = Math.max(1, score - reduction);
      }
      return a + f.wi_gi * score;
    }, 0) / W_TOTAL;

    // Specialist impact: 125k -> 25% reduction, 100k -> 15%, 75k -> 10%
    const specImpactMap: Record<string, number> = { 'none': 0, '75k': 0.10, '100k': 0.15, '125k': 0.25 };
    const specImpact = specImpactMap[selectedSpecialist] || 0;
    
    // Risk penalty for many protection objects
    let objectPenalty = 1;
    if (selectedObjects.length > 4) objectPenalty = 1.15;
    if (selectedObjects.length === PROTECTION_OBJECTS.length) objectPenalty = 1.30;

    const Z_after = Z_after_raw * (1 - specImpact) * objectPenalty;

    const R_SME = Math.min(1, Math.max(0, (Z_after - 1) / 9));
    
    const totalDowntime = excelDowntimeAfter !== null ? excelDowntimeAfter : customFactors.reduce((a, f) => {
      const riskFactor = (f.wi_gi * (scores[f.id] || f.dBefore)) / 10;
      return a + (f.downtime * riskFactor);
    }, 0);

    const initialDowntime = excelDowntimeBefore !== null ? excelDowntimeBefore : customFactors.reduce((a, f) => {
      const riskFactor = (f.wi_gi * (scores[f.id] || f.dBefore)) / 10;
      return a + (f.downtime * riskFactor);
    }, 0);

    let totalCost = 0;
    customFactors.forEach(f => {
      const tier = tierSelected[f.id];
      if (tier === 'budget') totalCost += f.budgetCost;
      if (tier === 'vip') totalCost += f.vipCost;
    });

    const totalDamage = (monthlyRevenue * 12) * R_SME;
    const initialDamage = (monthlyRevenue * 12) * ((Z_before - 1) / 9);

    // Ease of penetration before/after
    const archScoreBefore = scores['4.4'] || 5;
    const specScoreBefore = scores['5.1'] || 5;
    const R_SME_before = Math.min(1, Math.max(0, (Z_before - 1) / 9));
    const easeBefore = Math.min(10, Math.max(1, (R_SME_before * 8) + 10 - (archScoreBefore + specScoreBefore) / 4));

    const archScoreAfter = tierSelected['4.4'] ? (tierSelected['4.4'] === 'vip' ? 9 : 7) : archScoreBefore;
    const specScoreAfter = selectedSpecialist !== 'none' ? (selectedSpecialist === '125k' ? 9 : selectedSpecialist === '100k' ? 8 : 7) : specScoreBefore;
    const easeAfter = Math.min(10, Math.max(1, (R_SME * 8) + 10 - (archScoreAfter + specScoreAfter) / 4));

    setResults({
      R_SME,
      Z_before,
      Z_after,
      totalCost,
      totalDowntime,
      initialDowntime,
      totalDamage,
      initialDamage,
      marketType,
      competitorRange,
      easeBefore,
      easeAfter,
      specialistSalary: SPECIALISTS.find(s => s.id === selectedSpecialist)?.salary || 0
    });
    setStep(5);
  };

  const getRiskLevel = (r: number) => {
    if (r < 0.25) return { label: 'Низкий', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', hex: '#10b981' };
    if (r < 0.50) return { label: 'Средний', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', hex: '#f59e0b' };
    if (r < 0.75) return { label: 'Высокий', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', hex: '#f97316' };
    return { label: 'Критический', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', hex: '#ef4444' };
  };

  return (
    <div className="min-h-screen bg-[#080a0e] text-[#dde3f0] font-sans selection:bg-emerald-500/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[250px] -right-[200px] w-[700px] h-[700px] rounded-full bg-emerald-500/5 blur-[130px]" />
        <div className="absolute bottom-0 -left-[150px] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex flex-col gap-8 mb-12">
          <div className="flex items-center justify-between p-6 bg-blue-950/20 border border-blue-900/30 rounded-2xl backdrop-blur-sm">
            <LogoSKFU />
            <div className="hidden md:flex flex-col items-center text-center px-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#62708a] font-bold mb-1">Инновационный проект</span>
              <span className="text-xs font-medium text-white/80">Мандрица И.В. · Бугаева А.В. · Каххаров Ш.И.У. ®</span>
              <span className="text-[9px] text-[#62708a] mt-1 italic">свидетельство о регистрации электронной программы</span>
            </div>
            <div className="relative group">
              <div className="flex flex-col items-center gap-1 cursor-help">
                <div className="p-2 bg-white/5 border border-white/10 rounded-xl group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all duration-300">
                  <Github className="w-5 h-5 text-[#62708a] group-hover:text-emerald-400" />
                </div>
                <span className="text-[8px] uppercase tracking-tighter text-[#62708a] font-bold">GitHub</span>
              </div>
              
              <div className="absolute top-full right-0 mt-4 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 origin-top-right z-50">
                <div className="p-5 bg-[#0f1219] border border-[#1e2635] rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4 min-w-[200px]">
                  <div className="p-4 bg-white rounded-[2rem] shadow-inner">
                    <QRCodeCanvas 
                      value="https://github.com/goxaman2" 
                      size={140}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-[11px] font-bold text-white uppercase tracking-wider">Репозиторий проекта</div>
                    <div className="text-[10px] text-[#62708a] mt-1 font-mono">github.com/goxaman2</div>
                  </div>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-[#1e2635] to-transparent" />
                  <div className="text-[9px] text-emerald-400/60 italic">Наведите камеру для перехода</div>
                </div>
              </div>
            </div>
            <LogoOTZI />
          </div>

          <div className="flex flex-col gap-10 items-center text-center">
            <div className="flex flex-col gap-4 items-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Модель 16 факторов · CIA+AA
              </div>
              
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tighter leading-none">
                  Кибер<span className="text-emerald-400">Риски</span> КИИ
                </h1>
                <p className="text-lg md:text-xl text-white/40 font-medium tracking-tight">
                  (учреждения, фирмы, организации) v. 2.0
                </p>
              </div>

              <p className="text-sm text-[#62708a] max-w-2xl leading-relaxed">
                Оценка рисков ИБ со стоимостью мер защиты. Данные из 16-факторной модели, БДУ ФСТЭК и рыночных цен 2025–2026.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              <div className="flex flex-col items-center justify-center p-4 bg-[#0f1219]/50 border border-[#1e2635] rounded-3xl shadow-xl backdrop-blur-sm group hover:border-emerald-500/30 transition-all duration-300">
                <div className="text-[10px] uppercase tracking-widest text-[#62708a] font-bold mb-2">База экспертов</div>
                <div className="text-3xl font-black text-emerald-400">свыше 11</div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-[#0f1219]/50 border border-[#1e2635] rounded-3xl shadow-xl backdrop-blur-sm group hover:border-blue-500/30 transition-all duration-300">
                <div className="text-[10px] uppercase tracking-widest text-[#62708a] font-bold mb-2">Угрозы ФСТЭК</div>
                <div className="text-3xl font-black text-white">227</div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-[#0f1219]/50 border border-[#1e2635] rounded-3xl shadow-xl backdrop-blur-sm group hover:border-blue-500/30 transition-all duration-300">
                <div className="text-[10px] uppercase tracking-widest text-[#62708a] font-bold mb-2">Вендоры ИБ</div>
                <div className="text-3xl font-black text-white">{vendorCount}</div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-[#0f1219]/50 border border-[#1e2635] rounded-3xl shadow-xl backdrop-blur-sm group hover:border-blue-500/30 transition-all duration-300">
                <div className="text-[10px] uppercase tracking-widest text-[#62708a] font-bold mb-2">Ядро Парето</div>
                <div className="text-3xl font-black text-white">16</div>
              </div>
            </div>

            {customFactors !== FACTORS && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-[10px] uppercase tracking-widest text-blue-400 font-bold">
                <Upload className="w-3.5 h-3.5" />
                Загружены пользовательские показатели
              </div>
            )}
          </div>
        </header>

        {/* Methodology Modal */}
        <AnimatePresence>
          {selectedMethodFile && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedMethodFile(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-2xl bg-[#0f1219] border border-[#1e2635] rounded-[32px] overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-transparent">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
                      {selectedMethodFile.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-heading font-bold text-white">{selectedMethodFile.name}</h3>
                      <p className="text-xs text-[#62708a]">{selectedMethodFile.desc}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedMethodFile(null)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <RotateCcw className="w-5 h-5 text-[#62708a] rotate-45" />
                  </button>
                </div>
                
                <div className="p-8">
                  <div className="text-[10px] uppercase tracking-widest text-[#62708a] mb-4 font-bold">Содержимое модуля (Логика и формулы)</div>
                  <div className="bg-black/40 rounded-2xl p-6 border border-white/5 font-mono text-xs leading-relaxed text-emerald-400/80 overflow-x-auto">
                    <pre>{selectedMethodFile.content}</pre>
                  </div>
                  
                  <div className="mt-8 flex items-center gap-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                    <Info className="w-5 h-5 text-blue-400 shrink-0" />
                    <p className="text-[11px] text-[#62708a] leading-relaxed">
                      Данный модуль является частью закрытого ядра калькулятора. Изменения в логике этого файла влияют на итоговый индекс риска R_SME.
                    </p>
                  </div>
                </div>
                
                <div className="p-6 bg-white/5 flex justify-end">
                  <button 
                    onClick={() => setSelectedMethodFile(null)}
                    className="px-6 py-2 bg-emerald-500 text-black font-bold text-xs rounded-xl hover:bg-emerald-400 transition-all"
                  >
                    Закрыть хранилище
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#62708a] mb-2">
            <span>Шаг {step} из 5</span>
            <span>{Math.round((step / 5) * 100)}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-400 to-blue-400"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.5, ease: "circOut" }}
            />
          </div>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <section className="p-6 bg-[#0f1219] border border-[#1e2635] rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                  <Database className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <FileText className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h2 className="text-lg font-heading font-bold">База методологии</h2>
                  </div>
                  <p className="text-xs text-[#62708a] mb-6">Список файлов и модулей, на которых базируется расчетная модель калькулятора.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {METHODOLOGY_FILES.map((file, i) => (
                      <button 
                        key={i} 
                        onClick={() => setSelectedMethodFile(file)}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all group text-left"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-emerald-500 group-hover:animate-pulse" />
                          <span className="text-[10px] font-mono text-emerald-400">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] text-[#62708a] italic">{file.desc}</span>
                          <Eye className="w-3 h-3 text-[#2e3a50] group-hover:text-emerald-400 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer">
                        <Upload className="w-3 h-3" />
                        Импорт показателей (Excel/CSV)
                        <input 
                          type="file" 
                          accept=".xlsx, .xls, .csv" 
                          className="hidden" 
                          onChange={handleFileUpload}
                        />
                      </label>
                      {uploadedFileName && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-in fade-in slide-in-from-left-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] font-bold text-emerald-400 truncate max-w-[150px]">
                            {uploadedFileName}
                          </span>
                          <button 
                            onClick={() => {
                              setUploadedFileName(null);
                              setCustomFactors(FACTORS);
                              setExcelDowntimeBefore(null);
                              setExcelDowntimeAfter(null);
                            }}
                            className="ml-1 hover:text-white transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:bg-purple-500/20 transition-all cursor-pointer">
                        <ShoppingCart className="w-3 h-3" />
                        Импорт листинга вэндоров
                        <input 
                          type="file" 
                          accept=".xlsx, .xls, .csv" 
                          className="hidden" 
                          onChange={handleVendorUpload}
                        />
                      </label>
                      {vendorFileName && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg animate-in fade-in slide-in-from-left-2">
                          <CheckCircle2 className="w-3 h-3 text-purple-400" />
                          <span className="text-[10px] font-bold text-purple-400 truncate max-w-[150px]">
                            {vendorFileName}
                          </span>
                          <button 
                            onClick={() => setVendorFileName(null)}
                            className="ml-1 hover:text-white transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer">
                        <Target className="w-3 h-3" />
                        Импорт модели ядра Парето
                        <input 
                          type="file" 
                          accept=".xlsx, .xls, .csv" 
                          className="hidden" 
                          onChange={handleParetoUpload}
                        />
                      </label>
                      {paretoFileName && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-in fade-in slide-in-from-left-2">
                          <CheckCircle2 className="w-3 h-3 text-amber-400" />
                          <span className="text-[10px] font-bold text-amber-400 truncate max-w-[150px]">
                            {paretoFileName}
                          </span>
                          <button 
                            onClick={() => setParetoFileName(null)}
                            className="ml-1 hover:text-white transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-[#62708a] italic block">
                      * Загрузите файлы для настройки расчетной модели и базы вэндоров.
                    </span>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-heading font-bold mb-2">Выберите отрасль</h2>
                <p className="text-sm text-[#62708a] mb-6">Профиль автоматически подставляет базовые вероятности угроз.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {SECTORS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSector(s.id)}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left relative overflow-hidden group ${
                        selectedSector === s.id 
                        ? 'bg-emerald-500/10 border-emerald-500/50' 
                        : 'bg-[#0f1219] border-[#1e2635] hover:border-emerald-500/30'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selectedSector === s.id ? 'bg-emerald-400 text-black' : 'bg-[#161b25] text-[#62708a] group-hover:text-emerald-400'}`}>
                        {s.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{s.name}</div>
                        <div className="text-[10px] text-[#62708a] mt-1">{s.sub}</div>
                      </div>
                      {selectedSector === s.id && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#161b25] border border-white/5 rounded-3xl mb-8">
                  <div className="space-y-4 col-span-full">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#62708a] text-center mb-2">
                      Выберите годовую выручку (₽)
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: '1-4', label: 'от 1 до 4 млн.', avg: 2500000 },
                        { id: '4-10', label: 'от 4 до 10 млн.', avg: 7000000 },
                        { id: '10+', label: 'от 10 и выше млн.', avg: 15000000 }
                      ].map(range => (
                        <button
                          key={range.id}
                          onClick={() => {
                            setRevenueRange(range.id as any);
                            setMonthlyRevenue(Math.round(range.avg / 12));
                          }}
                          className={`p-4 rounded-2xl border transition-all text-center flex flex-col gap-2 ${
                            revenueRange === range.id 
                              ? 'bg-emerald-500/20 border-emerald-500 text-white' 
                              : 'bg-[#0f1219] border-[#1e2635] text-[#62708a] hover:bg-white/5'
                          }`}
                        >
                          <span className="text-[10px] font-bold">{range.label}</span>
                          {revenueRange === range.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-[9px] text-emerald-400 font-black"
                            >
                              ~{(range.avg / 12).toLocaleString()} ₽/мес
                            </motion.div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4 col-span-full">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#62708a] text-center">
                      Выручка фирмы за год (₽)
                    </label>
                    <div className="w-full bg-[#0f1219]/50 border border-[#1e2635] rounded-xl px-4 py-3 text-emerald-400 font-bold text-center">
                      {revenueRange ? (revenueRange === '10+' ? 'от 10,000,000' : (revenueRange === '1-4' ? '1,000,000 - 4,000,000' : '4,000,000 - 10,000,000')) : '0'} ₽
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[#161b25] border border-white/5 rounded-3xl space-y-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#62708a] mb-6 text-center">
                      Введите количество конкурентов
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: '1-2', label: 'от 1 до 2', mult: 7.5, avg: 1.5 },
                        { id: '3-10', label: 'от 3 до 10', mult: 15.5, avg: 6.5 },
                        { id: '11+', label: 'от 11 и выше', mult: 33, avg: 15 }
                      ].map(range => (
                        <button
                          key={range.id}
                          onClick={() => setCompetitorRange(range.id as any)}
                          className={`p-4 rounded-2xl border transition-all text-center flex flex-col gap-2 ${
                            competitorRange === range.id 
                              ? 'bg-orange-500/20 border-orange-500 text-white' 
                              : 'bg-[#0f1219] border-[#1e2635] text-[#62708a] hover:bg-white/5'
                          }`}
                        >
                          <span className="text-xs font-bold">{range.label}</span>
                          {competitorRange === range.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-[9px] text-orange-400 font-black"
                            >
                              Доля на рынке: {((monthlyRevenue * 12) * range.avg * range.mult).toLocaleString()} ₽
                            </motion.div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {competitorRange && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-6 border-t border-white/5 space-y-6"
                    >
                      {competitorRange === '1-2' && (
                        <div className="flex items-center justify-between p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Критерий Дуополии</div>
                            <div className="text-[9px] text-[#62708a]">Два игрока контролируют &gt;80% рынка?</div>
                          </div>
                          <button 
                            onClick={() => setHighConcentration(!highConcentration)}
                            className={`w-12 h-6 rounded-full transition-all relative ${highConcentration ? 'bg-blue-500' : 'bg-white/10'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${highConcentration ? 'left-7' : 'left-1'}`} />
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#62708a] mb-4 text-center">
                          Тип рынка (определен автоматически)
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'duopoly', label: 'Дуопольный' },
                            { id: 'oligopoly', label: 'Олигопольный' },
                            { id: 'perfect', label: 'Совершенная конкуренция' }
                          ].map(type => (
                            <div
                              key={type.id}
                              className={`p-3 rounded-xl border text-[10px] font-bold text-center transition-all ${
                                marketType === type.id 
                                  ? 'bg-blue-500/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                                  : 'bg-[#0f1219] border-[#1e2635] text-[#62708a] opacity-40'
                              }`}
                            >
                              {type.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </section>

              {selectedSector && (
                <motion.section
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-6 border-t border-white/5"
                >
                  <h2 className="text-xl font-heading font-bold mb-2">Выберите тип специалиста в вашем штатном расписании</h2>
                  <p className="text-sm text-[#62708a] mb-8">Наличие выделенного сотрудника по ИБ значительно снижает риски.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {SPECIALISTS.map(spec => {
                      const isDisabled = (selectedObjects.length > 4 && spec.id === 'none') || 
                                       (selectedObjects.length === PROTECTION_OBJECTS.length && (spec.id === 'none' || spec.id === '75k'));
                      
                      return (
                        <button
                          key={spec.id}
                          disabled={isDisabled}
                          onClick={() => setSelectedSpecialist(spec.id)}
                          className={`flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all relative overflow-hidden group ${
                            isDisabled ? 'opacity-20 grayscale cursor-not-allowed' :
                            selectedSpecialist === spec.id
                            ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)] scale-[1.02]'
                            : 'bg-[#0f1219] border-[#1e2635] hover:border-blue-500/30'
                          }`}
                        >
                          {selectedSpecialist === spec.id && !isDisabled && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
                          )}
                          
                          <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                            selectedSpecialist === spec.id && !isDisabled
                            ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] rotate-[360deg]' 
                            : 'bg-[#161b25] text-[#2e3a50] group-hover:text-blue-400/50'
                          }`}>
                            {spec.icon}
                          </div>

                          <div className="text-center">
                            <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${
                              selectedSpecialist === spec.id && !isDisabled ? 'text-blue-400' : 'text-[#62708a]'
                            }`}>
                              {spec.nick}
                            </div>
                            <div className={`text-lg font-heading font-bold mb-1 ${
                              selectedSpecialist === spec.id && !isDisabled ? 'text-white' : 'text-white/40'
                            }`}>
                              {spec.label}
                            </div>
                            <div className={`text-[9px] leading-tight max-w-[100px] mx-auto ${
                              selectedSpecialist === spec.id && !isDisabled ? 'text-blue-200/60' : 'text-[#62708a]/40'
                            }`}>
                              {spec.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.section>
              )}

              {selectedSector && (
                <motion.section
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-6 border-t border-white/5"
                >
                  <h2 className="text-xl font-heading font-bold mb-2">Выберите объекты защиты</h2>
                  <p className="text-sm text-[#62708a] mb-8">Отметьте системы и отделы, которые формируют критическую информационную инфраструктуру (КИИ) вашей фирмы.</p>
                  
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-[#62708a]">
                        Тип архитектуры вашей сети
                      </label>
                      <button 
                        onClick={() => setShowArchHelp(true)}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-bold uppercase tracking-widest text-blue-400 hover:bg-blue-500/20 transition-all"
                      >
                        <Info className="w-3 h-3" />
                        Помочь выбрать
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {ARCHITECTURE_TYPES.map(arch => (
                        <button
                          key={arch.id}
                          onClick={() => setSelectedArchitecture(arch.id)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center group ${
                            selectedArchitecture === arch.id
                            ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                            : 'bg-[#0f1219] border-[#1e2635] hover:border-blue-500/30'
                          }`}
                        >
                          <div className={`p-2 rounded-lg transition-colors ${
                            selectedArchitecture === arch.id ? 'bg-blue-500 text-white' : 'bg-[#161b25] text-[#62708a] group-hover:text-blue-400'
                          }`}>
                            {arch.icon}
                          </div>
                          <div>
                            <div className={`text-[11px] font-bold leading-tight ${selectedArchitecture === arch.id ? 'text-white' : 'text-white/60'}`}>
                              {arch.label}
                            </div>
                            <div className="text-[8px] text-[#62708a] mt-1 leading-tight">
                              {arch.desc}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Architecture Help Modal */}
                  <AnimatePresence>
                    {showArchHelp && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
                        onClick={() => setShowArchHelp(false)}
                      >
                        <motion.div 
                          initial={{ scale: 0.9, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0.9, y: 20 }}
                          className="w-full max-w-4xl bg-[#0f1219] border border-[#1e2635] rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-heading font-bold text-white">Гид по архитектурам</h3>
                              <p className="text-xs text-[#62708a]">Выберите модель, которая больше всего похожа на вашу компанию</p>
                            </div>
                            <button 
                              onClick={() => setShowArchHelp(false)}
                              className="p-2 hover:bg-white/5 rounded-full transition-colors"
                            >
                              <RotateCcw className="w-5 h-5 text-[#62708a] rotate-45" />
                            </button>
                          </div>

                          <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ARCHITECTURE_TYPES.map(arch => (
                              <button
                                key={arch.id}
                                onClick={() => {
                                  setSelectedArchitecture(arch.id);
                                  setShowArchHelp(false);
                                }}
                                className={`flex flex-col p-6 rounded-2xl border transition-all text-left group ${
                                  selectedArchitecture === arch.id
                                  ? 'bg-blue-500/10 border-blue-500'
                                  : 'bg-white/5 border-white/5 hover:border-blue-500/30'
                                }`}
                              >
                                <div className="mb-4 bg-black/40 rounded-xl overflow-hidden border border-white/5">
                                  <ArchitectureDiagram type={arch.id} />
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={`p-2 rounded-lg ${selectedArchitecture === arch.id ? 'bg-blue-500 text-white' : 'bg-[#161b25] text-blue-400'}`}>
                                    {arch.icon}
                                  </div>
                                  <div className="font-bold text-white">{arch.label}</div>
                                </div>
                                <p className="text-[10px] text-[#62708a] leading-relaxed mb-4">
                                  {arch.hint}
                                </p>
                                <div className="space-y-2">
                                  {arch.check?.map((c, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <CheckCircle2 className="w-3 h-3 text-blue-500/50" />
                                      <span className="text-[9px] text-white/40">{c}</span>
                                    </div>
                                  ))}
                                </div>
                              </button>
                            ))}
                          </div>

                          <div className="p-6 bg-white/5 flex justify-center">
                            <p className="text-[10px] text-[#62708a] italic">
                              * Тип архитектуры влияет на коэффициент сложности защиты и итоговый индекс риска.
                            </p>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {PROTECTION_OBJECTS.map(obj => (
                      <button
                        key={obj.id}
                        onClick={() => toggleObject(obj.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
                          selectedObjects.includes(obj.id)
                          ? 'bg-violet-500/10 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                          : 'bg-[#0f1219] border-[#1e2635] hover:border-violet-500/30'
                        }`}
                      >
                        <div className={`p-2 rounded-lg transition-colors ${
                          selectedObjects.includes(obj.id) ? 'bg-violet-500 text-white' : 'bg-[#161b25] text-[#62708a] group-hover:text-violet-400'
                        }`}>
                          {obj.icon}
                        </div>
                        <div className="flex flex-col">
                          <div className={`text-[11px] font-bold leading-tight ${selectedObjects.includes(obj.id) ? 'text-white' : 'text-white/60'}`}>
                            {obj.label}
                          </div>
                          <div className="text-[8px] uppercase tracking-wider text-[#62708a] mt-0.5">
                            {obj.category}
                          </div>
                        </div>
                        {selectedObjects.includes(obj.id) && (
                          <div className="ml-auto">
                            <CheckCircle2 className="w-3 h-3 text-violet-400" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.section>
              )}

              <div className="flex justify-end pt-6">
                <button
                  disabled={!selectedSector || selectedObjects.length === 0}
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-400 text-black font-heading font-bold text-xs rounded-lg hover:bg-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Далее <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="space-y-8"
            >
              <section className="relative overflow-hidden p-10 bg-[#0f1219] border border-[#1e2635] rounded-[40px] shadow-2xl">
                <div className="relative z-10">
                  <h2 className="text-3xl font-heading font-black mb-2 text-center bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    Ландшафт угроз КИИ
                  </h2>
                  
                  <div className="flex justify-center gap-4 mb-8">
                    <button 
                      onClick={() => setViewMode('landscape')}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'landscape' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-[#62708a] hover:bg-white/10'}`}
                    >
                      Ландшафт (Вирус)
                    </button>
                    <button 
                      onClick={() => setViewMode('architecture')}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'architecture' ? 'bg-blue-500 text-white' : 'bg-white/5 text-[#62708a] hover:bg-white/10'}`}
                    >
                      Архитектура КИИ
                    </button>
                    <label className="px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-violet-500/20 transition-all flex items-center gap-2">
                      <Upload className="w-3 h-3" />
                      Обновить данные
                      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      ДАТА состояния: {new Date().toLocaleDateString('ru-RU')}
                    </div>
                  </div>

                  <p className="text-sm text-[#62708a] mb-16 text-center max-w-xl mx-auto">
                    {viewMode === 'landscape' 
                      ? "Визуализация 16-факторной модели атак в виде агрессивной среды. Длина «шипов» вируса соответствует величине риска по данным NIST и БДУ ФСТЭК."
                      : "Структурная схема КИИ фирмы. Отражает уровни защиты и легкость проникновения злоумышленника к критическим активам."}
                  </p>

                  <div className="relative h-[600px] flex items-center justify-center">
                    {/* Electric Current Animation (Penetration path) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20">
                      <defs>
                        <linearGradient id="electric-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                          <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      
                      {/* Current from Top to Center */}
                      <motion.path
                        d="M 50% 0 L 50% 50%"
                        stroke="url(#electric-gradient)"
                        strokeWidth="2"
                        fill="none"
                        animate={{
                          strokeDasharray: ["0, 100", "100, 0"],
                          strokeDashoffset: [0, -100]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="opacity-40"
                      />
                      
                      {/* Current from Center to KII Objects */}
                      {selectedObjects.map((objId, idx) => {
                        const obj = PROTECTION_OBJECTS.find(o => o.id === objId);
                        if (!obj || !obj.category.includes('КИИ')) return null;
                        
                        const angle = (idx / selectedObjects.length) * 2 * Math.PI + (Date.now() / 20000);
                        const radius = 280;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        
                        return (
                          <motion.path
                            key={`current-${objId}`}
                            d={`M 50% 50% L calc(50% + ${x}px) calc(50% + ${y}px)`}
                            stroke="#3b82f6"
                            strokeWidth="1.5"
                            fill="none"
                            strokeDasharray="4 8"
                            animate={{
                              strokeDashoffset: [0, -24]
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="opacity-30"
                            filter="url(#glow)"
                          />
                        );
                      })}
                    </svg>

                    {/* The Cyber-Virus Core (Always visible as the threat source) */}
                    <div className={`relative w-72 h-72 rounded-full bg-red-500/5 border-4 border-red-500/20 flex items-center justify-center shadow-[0_0_120px_rgba(239,68,68,0.25)] transition-all duration-500 ${viewMode === 'architecture' ? 'scale-75 opacity-50' : ''}`}>
                      <div className="absolute inset-0 rounded-full animate-[pulse_3s_ease-in-out_infinite] bg-red-500/10" />
                      <div className="absolute inset-[-20px] rounded-full border border-red-500/10 animate-[spin_20s_linear_infinite]" style={{ borderDasharray: '10 20' }} />
                      
                      <Bug className="w-32 h-32 text-red-500/10 animate-[bounce_3s_ease-in-out_infinite] absolute opacity-20" />
                      
                      {/* Core Labels - Residual Risk */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        <div className="bg-red-500/20 px-3 py-1 rounded-full mb-2 border border-red-500/30">
                          <span className="text-[9px] font-black uppercase tracking-widest text-red-400">УГРОЗА: ВЫСОКАЯ</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#62708a] mb-1">Остаточный риск</span>
                        <span className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{Math.round(currentRSME * 100)}%</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-red-400 mt-2">R_SME Index</span>
                        
                        {/* Ease of Penetration in Center */}
                        <div className="mt-4 flex flex-col items-center bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
                          <span className="text-[8px] font-bold uppercase tracking-widest text-blue-400">Легкость проникновения</span>
                          <span className="text-2xl font-black text-white">10/10</span>
                        </div>
                      </div>
                    </div>

                    {/* Date and Downtime Info (Floating Top Right) */}
                    <div className="absolute top-0 right-0 p-6 flex flex-col gap-4 z-50">
                      {viewMode === 'landscape' ? (
                        <div className="bg-red-500/20 border-2 border-red-500/40 rounded-2xl p-5 backdrop-blur-xl shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-2">ПРОСТОЙ фирмы (K18/K19)</div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">
                              {results ? Math.round(results.totalDowntime) : "0"}
                            </span>
                            <span className="text-sm font-bold text-red-400 uppercase">часов</span>
                          </div>
                          <div className="mt-1 text-[11px] font-bold text-[#62708a]">
                            ≈ {results ? (results.totalDowntime / 24).toFixed(1) : "0"} рабочих дней
                          </div>
                        </div>
                      ) : (
                        <div className="bg-orange-500/20 border-2 border-orange-500/40 rounded-2xl p-5 backdrop-blur-xl shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 mb-2">Вероятный УЩЕРБ фирмы (L18)</div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">
                              {results ? Math.round(results.totalDamage).toLocaleString() : "0"}
                            </span>
                            <span className="text-sm font-bold text-orange-400 uppercase">₽</span>
                          </div>
                          <div className="mt-1 text-[11px] font-bold text-[#62708a]">
                            Прогноз финансовых потерь
                          </div>
                        </div>
                      )}

                      {/* Smart Legend */}
                      <div className="bg-[#0f1219]/90 border border-white/10 rounded-2xl p-4 backdrop-blur-md space-y-3">
                        <div className="text-[9px] font-black uppercase tracking-widest text-[#62708a] border-b border-white/5 pb-2">Легенда системы</div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                          <span className="text-[10px] text-white/70">Источник угрозы (Вирус)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                          <span className="text-[10px] text-white/70">Замороженный отдел КИИ</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-0.5 bg-gradient-to-r from-red-500 to-transparent" />
                          <span className="text-[10px] text-white/70">Вектор атаки (Риск)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-0.5 bg-blue-500/40 border-t border-dashed border-blue-400" />
                          <span className="text-[10px] text-white/70">Путь проникновения</span>
                        </div>
                      </div>
                    </div>

                    {viewMode === 'landscape' ? (
                      /* Orbiting Assets (Landscape View) */
                      selectedObjects.map((objId, objIdx) => {
                        const obj = PROTECTION_OBJECTS.find(o => o.id === objId);
                        if (!obj) return null;
                        
                        const angle = (objIdx / selectedObjects.length) * 2 * Math.PI + (Date.now() / 20000);
                        const radius = 280;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;

                        const assignedFactors = getRelevantFactors(objId, obj.category, customFactors);

                        return (
                          <React.Fragment key={objId}>
                            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                              <motion.line
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.1 }}
                                x1="50%" y1="50%"
                                x2={`calc(50% + ${x}px)`} y2={`calc(50% + ${y}px)`}
                                stroke="#ef4444"
                                strokeWidth="1"
                              />
                            </svg>

                            <motion.div
                              animate={{ x, y }}
                              transition={{ duration: 0.1 }}
                              className="absolute z-30"
                            >
                              <div className="relative group/asset">
                                <div className={`relative p-2 bg-[#161b25]/95 backdrop-blur-md border rounded-lg shadow-2xl flex items-center gap-2 z-10 transition-all duration-500 ${
                                  obj.category.includes('КИИ') 
                                    ? 'border-white ring-4 ring-white/40 shadow-[0_0_40px_rgba(255,255,255,0.5)] bg-white/10' 
                                    : 'border-blue-500/40'
                                }`}>
                                  {obj.category.includes('КИИ') && (
                                    <div className="absolute inset-0 bg-white/5 animate-pulse rounded-lg pointer-events-none" />
                                  )}
                                  <div className={`${obj.category.includes('КИИ') ? 'text-white' : 'text-blue-400'} scale-75`}>{obj.icon}</div>
                                  <div className="flex flex-col">
                                    <span className={`text-[8px] font-bold whitespace-nowrap ${obj.category.includes('КИИ') ? 'text-white' : 'text-white'}`}>{obj.label}</span>
                                    {obj.category.includes('КИИ') && (
                                      <span className="text-[6px] font-black text-white uppercase tracking-tighter flex items-center gap-1">
                                        <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                                        Заморожен (КИИ)
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {assignedFactors.map((f, fIdx) => {
                                  const spikeAngle = (fIdx / assignedFactors.length) * 2 * Math.PI;
                                  const likelihood = f.wi;
                                  const impact = f.gi;
                                  const riskFactor = (f.wi_gi * (scores[f.id] || f.dBefore)) / 10;
                                  const spikeLen = 35 + (riskFactor * 20);
                                  const sx = Math.cos(spikeAngle) * spikeLen;
                                  const sy = Math.sin(spikeAngle) * spikeLen;

                                  return (
                                    <div key={`${objId}-${f.id}`} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <svg className="absolute overflow-visible">
                                        <motion.line
                                          x1="0" y1="0"
                                          x2={sx} y2={sy}
                                          stroke={riskFactor > 1.2 ? '#ef4444' : riskFactor > 0.8 ? '#f59e0b' : '#10b981'}
                                          strokeWidth={obj.category.includes('КИИ') ? "3" : "1.5"}
                                          className="opacity-60"
                                        />
                                        <motion.circle
                                          cx={sx * 0.85} cy={sy * 0.85}
                                          r={obj.category.includes('КИИ') ? "2" : "1"}
                                          fill={riskFactor > 1.2 ? '#ef4444' : riskFactor > 0.8 ? '#f59e0b' : '#10b981'}
                                          className="opacity-40"
                                        />
                                      </svg>
                                      <motion.div
                                        animate={{ 
                                          scale: riskFactor > 1.2 ? [1, 1.15, 1] : [1, 1.1, 1],
                                          x: [sx, sx * 1.03, sx],
                                          y: [sy, sy * 1.03, sy]
                                        }}
                                        transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
                                        className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-auto cursor-help group/spike ${
                                          riskFactor > 1.2 ? 'bg-red-600/60 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 
                                          riskFactor > 0.8 ? 'bg-orange-600/60 border-orange-400' : 
                                          'bg-emerald-600/60 border-emerald-400'
                                        } ${obj.category.includes('КИИ') && riskFactor > 1.0 ? 'ring-2 ring-white animate-pulse scale-110' : ''}`}
                                      >
                                        <span className="text-[7px] font-black text-white drop-shadow-md">{f.id}</span>
                                        <div className="absolute bottom-full mb-1 hidden group-hover/spike:block w-36 p-2 bg-black/95 border border-white/10 rounded-lg text-[7px] text-white z-50 shadow-2xl pointer-events-none">
                                          <div className="font-bold text-red-400 leading-tight mb-1">{f.name}</div>
                                          <div className="grid grid-cols-2 gap-1 opacity-80">
                                            <div>L (Вероятность): <span className="text-white font-bold">{likelihood}</span></div>
                                            <div>I (Ущерб): <span className="text-white font-bold">{impact}</span></div>
                                          </div>
                                          <div className="mt-1 pt-1 border-t border-white/10 flex justify-between items-center">
                                            <span>Интегральный риск:</span>
                                            <span className="text-red-400 font-bold">{(riskFactor * 10).toFixed(1)}</span>
                                          </div>
                                        </div>
                                      </motion.div>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          </React.Fragment>
                        );
                      })
                    ) : (
                      /* Architecture View */
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Architectural Layers */}
                        <div className="relative w-full h-full flex items-center justify-center">
                          {[320, 220, 120].map((r, i) => (
                            <div 
                              key={i}
                              className="absolute rounded-full border border-white/5 bg-white/[0.01] flex items-center justify-center"
                              style={{ width: r * 2, height: r * 2 }}
                            >
                              <div className="absolute top-2 text-[8px] font-black uppercase tracking-widest text-[#2e3a50]">
                                {i === 0 ? "Внешний периметр" : i === 1 ? "Корпоративная сеть" : "Ядро КИИ"}
                              </div>
                            </div>
                          ))}
                          
                          {/* Connection Lines between layers for visual structure */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
                            <circle cx="50%" cy="50%" r="120" fill="none" stroke="white" strokeDasharray="5 5" />
                            <circle cx="50%" cy="50%" r="220" fill="none" stroke="white" strokeDasharray="5 5" />
                            <circle cx="50%" cy="50%" r="320" fill="none" stroke="white" strokeDasharray="5 5" />
                          </svg>

                          {/* Threat Channels and Top Threats labels */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                            {selectedObjects.map((objId, idx) => {
                              const obj = PROTECTION_OBJECTS.find(o => o.id === objId);
                              if (!obj) return null;
                              
                              let layerRadius = 320;
                              if (obj.category.includes('КИИ')) layerRadius = 120;
                              else if (obj.category.includes('ИТКС') || obj.category.includes('Web')) layerRadius = 220;

                              const angle = (idx / selectedObjects.length) * 2 * Math.PI;
                              const x2 = Math.cos(angle) * layerRadius;
                              const y2 = Math.sin(angle) * layerRadius;

                              const isKII = obj.category.includes('КИИ');

                              return (
                                <g key={`channel-${objId}`}>
                                  {/* The Channel Line */}
                                  <motion.line
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: isKII ? 0.4 : 0.15 }}
                                    x1="50%" y1="50%"
                                    x2={`calc(50% + ${x2}px)`} y2={`calc(50% + ${y2}px)`}
                                    stroke={isKII ? "#ef4444" : "#3b82f6"}
                                    strokeWidth={isKII ? "2" : "1"}
                                    strokeDasharray={isKII ? "none" : "4 4"}
                                  />
                                  {/* Penetration Pulse */}
                                  <motion.circle
                                    r="3"
                                    fill={isKII ? "#ef4444" : "#3b82f6"}
                                    animate={{
                                      cx: ["50%", `calc(50% + ${x2}px)`],
                                      cy: ["50%", `calc(50% + ${y2}px)`],
                                      opacity: [0, 1, 0]
                                    }}
                                    transition={{
                                      duration: 2 + Math.random() * 2,
                                      repeat: Infinity,
                                      ease: "linear"
                                    }}
                                  />
                                </g>
                              );
                            })}
                          </svg>

                          {/* Top Dangerous Threats floating labels */}
                          <div className="absolute inset-0 pointer-events-none">
                            {topDangerousThreats.map((threat, tIdx) => {
                              const angle = (tIdx * 120 - 90) * (Math.PI / 180);
                              const x = Math.cos(angle) * 380;
                              const y = Math.sin(angle) * 380;
                              
                              return (
                                <motion.div
                                  key={`top-threat-${threat.id}`}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1, x, y }}
                                  className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
                                >
                                  <div className="bg-red-600/20 border border-red-500/40 backdrop-blur-xl px-4 py-2 rounded-2xl flex flex-col items-center gap-1 shadow-2xl animate-pulse min-w-[140px]">
                                    <div className="flex items-center gap-2">
                                      <Skull className="w-4 h-4 text-red-400" />
                                      <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">
                                        Критическая угроза
                                      </span>
                                    </div>
                                    <div className="text-[8px] text-red-200 font-bold text-center leading-tight">
                                      {threat.name}
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* KII Objects in Architecture */}
                          {selectedObjects.map((objId, idx) => {
                            const obj = PROTECTION_OBJECTS.find(o => o.id === objId);
                            if (!obj) return null;

                            // Determine layer based on category
                            let layerRadius = 320;
                            let layerName = "Внешний контур";
                            if (obj.category.includes('КИИ')) {
                              layerRadius = 120;
                              layerName = "Ядро КИИ";
                            } else if (obj.category.includes('ИТКС') || obj.category.includes('Web')) {
                              layerRadius = 220;
                              layerName = "Периметр";
                            }

                            const angle = (idx / selectedObjects.length) * 2 * Math.PI;
                            const x = Math.cos(angle) * layerRadius;
                            const y = Math.sin(angle) * layerRadius;

                            return (
                              <motion.div
                                key={objId}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1, x, y }}
                                className="absolute z-40"
                              >
                                <div className={`p-3 bg-[#0f1219] border rounded-2xl shadow-xl flex flex-col items-center gap-1 min-w-[100px] ${
                                  obj.category.includes('КИИ') ? 'border-red-500/50 shadow-red-500/10' : 'border-white/10'
                                }`}>
                                  <div className={obj.category.includes('КИИ') ? 'text-red-400' : 'text-blue-400'}>
                                    {obj.icon}
                                  </div>
                                  <span className="text-[9px] font-bold text-white text-center">{obj.label}</span>
                                  <span className="text-[7px] text-[#62708a] uppercase tracking-tighter">{layerName}</span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <div className="p-5 bg-red-500/5 rounded-3xl border border-red-500/10">
                      <div className="flex items-center gap-3 mb-3 text-red-400">
                        <Skull className="w-5 h-5" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Агрессивность</span>
                      </div>
                      <p className="text-[11px] text-[#62708a] leading-relaxed">
                        Вирус использует 16 векторов атаки. Наиболее опасные (длинные шипы) нацелены на {
                          customFactors.sort((a, b) => b.wi_gi - a.wi_gi).slice(0, 2).map(f => f.name).join(' и ')
                        }.
                      </p>
                    </div>
                    <div className="p-5 bg-orange-500/5 rounded-3xl border border-orange-500/10">
                      <div className="flex items-center gap-3 mb-3 text-orange-400">
                        <Zap className="w-5 h-5" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Инкубация</span>
                      </div>
                      <p className="text-[11px] text-[#62708a] leading-relaxed">
                        Среднее время скрытого присутствия (Dwell Time) в сетях КИИ составляет 45-90 дней до активации шифровальщика.
                      </p>
                    </div>
                    <div className="p-5 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                      <div className="flex items-center gap-3 mb-3 text-emerald-400">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Иммунитет</span>
                      </div>
                      <p className="text-[11px] text-[#62708a] leading-relaxed">
                        Внедрение мер защиты на 4-м шаге позволит «купировать» шипы вируса, снижая их длину и вероятность поражения активов.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-6 py-3 border border-[#1e2635] text-[#62708a] font-heading font-bold text-xs rounded-lg hover:text-white hover:border-white/20 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Назад
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-400 text-black font-heading font-bold text-xs rounded-lg hover:bg-emerald-300 transition-all"
                >
                  Далее <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <section>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-xl font-heading font-bold mb-1">Стратегия защиты</h2>
                    <p className="text-sm text-[#62708a]">Выберите желаемый уровень защищенности для каждой группы угроз.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const newTiers: any = {};
                        customFactors.forEach(f => newTiers[f.id] = null);
                        setTierSelected(newTiers);
                      }}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold uppercase text-[#62708a] hover:text-white transition-all"
                    >
                      Сбросить все
                    </button>
                    <button 
                      onClick={() => {
                        const newTiers: any = {};
                        customFactors.forEach(f => newTiers[f.id] = 'vip');
                        setTierSelected(newTiers);
                      }}
                      className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-[9px] font-bold uppercase text-purple-400 hover:bg-purple-500/30 transition-all"
                    >
                      Максимум для всех
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {customFactors.map(f => {
                    const tier = tierSelected[f.id];
                    
                    return (
                      <div key={f.id} className={`p-4 bg-[#0f1219] border rounded-xl transition-all ${
                        tier === 'vip' ? 'border-purple-500/30 bg-purple-500/5' : 
                        tier === 'budget' ? 'border-emerald-500/30 bg-emerald-500/5' : 
                        'border-[#1e2635]'
                      }`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              tier === 'vip' ? 'bg-purple-500 text-white' : 
                              tier === 'budget' ? 'bg-emerald-500 text-white' : 
                              'bg-[#161b25] text-[#2e3a50]'
                            }`}>
                              {tier ? <ShieldCheck className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                            </div>
                            <div>
                              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{f.id} · {f.groupName}</div>
                              <div className="text-sm font-semibold">{f.name}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 p-1 bg-[#080a0e] rounded-lg border border-[#1e2635]">
                            <button
                              onClick={() => setTierSelected(prev => ({ ...prev, [f.id]: null }))}
                              className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase transition-all ${
                                tier === null
                                ? 'bg-[#1e2635] text-white shadow-lg'
                                : 'text-[#62708a] hover:text-[#94a3b8]'
                              }`}
                            >
                              Эконом
                            </button>
                            <button
                              onClick={() => setTierSelected(prev => ({ ...prev, [f.id]: 'budget' }))}
                              className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase transition-all ${
                                tier === 'budget'
                                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                                : 'text-[#62708a] hover:text-emerald-400'
                              }`}
                            >
                              Средний
                            </button>
                            <button
                              onClick={() => setTierSelected(prev => ({ ...prev, [f.id]: 'vip' }))}
                              className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase transition-all ${
                                tier === 'vip'
                                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                : 'text-[#62708a] hover:text-purple-400'
                              }`}
                            >
                              Максимум
                            </button>
                          </div>
                        </div>
                        
                        {/* Tooltip-like info about the choice */}
                        <div className="mt-3 flex items-center gap-4 px-3 py-2 bg-black/20 rounded-lg border border-white/5">
                          <div className="flex-1">
                            <div className="text-[9px] text-[#62708a] uppercase font-bold mb-0.5">Решение:</div>
                            <div className="text-[10px] text-white/80 font-medium">
                              {tier === 'vip' ? f.vipVendor : tier === 'budget' ? f.budgetVendor : 'Базовые настройки ОС и ПО'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[9px] text-[#62708a] uppercase font-bold mb-0.5">Стоимость:</div>
                            <div className={`text-[10px] font-bold ${tier === 'vip' ? 'text-purple-400' : tier === 'budget' ? 'text-emerald-400' : 'text-[#62708a]'}`}>
                              {tier === 'vip' ? `${f.vipCost.toLocaleString()} ₽` : tier === 'budget' ? (f.budgetCost === 0 ? 'Бесплатно' : `${f.budgetCost.toLocaleString()} ₽`) : '0 ₽'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-3 border border-[#1e2635] text-[#62708a] font-heading font-bold text-xs rounded-lg hover:text-white hover:border-white/20 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Назад
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-400 text-black font-heading font-bold text-xs rounded-lg hover:bg-emerald-300 transition-all"
                >
                  Далее <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <section>
                <h2 className="text-xl font-heading font-bold mb-2">Персонал и Бюджет</h2>
                <p className="text-sm text-[#62708a] mb-8">Выберите специалиста для сопровождения выбранных мер и подтвердите итоговый бюджет.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Specialist Selection */}
                  <div className="p-6 bg-[#0f1219] border border-[#1e2635] rounded-2xl">
                    <div className="text-[10px] text-[#62708a] uppercase font-bold tracking-widest mb-4">Специалист по ИБ</div>
                    <div className="grid grid-cols-2 gap-3">
                      {SPECIALISTS.map(spec => (
                        <button
                          key={spec.id}
                          onClick={() => setSelectedSpecialist(spec.id)}
                          className={`p-4 rounded-xl border transition-all text-left ${
                            selectedSpecialist === spec.id 
                            ? 'bg-blue-500/10 border-blue-500 text-white' 
                            : 'bg-[#161b25] border-[#1e2635] text-[#62708a] hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedSpecialist === spec.id ? 'bg-blue-500 text-white' : 'bg-white/5 text-[#2e3a50]'}`}>
                              <User className="w-4 h-4" />
                            </div>
                            <div className="text-[10px] font-bold uppercase">{spec.label}</div>
                          </div>
                          <div className="text-xs font-bold">{spec.salary.toLocaleString()} ₽/мес</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget Summary */}
                  <div className="p-6 bg-[#0f1219] border border-[#1e2635] rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] text-[#62708a] uppercase font-bold tracking-widest mb-4">Итоговые затраты</div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#62708a]">Меры защиты:</span>
                          <span className="text-white font-bold">
                            {Object.entries(tierSelected).reduce((acc, [id, tier]) => {
                              const f = customFactors.find(cf => cf.id === id);
                              if (!f) return acc;
                              return acc + (tier === 'budget' ? f.budgetCost : tier === 'vip' ? f.vipCost : 0);
                            }, 0).toLocaleString()} ₽
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[#62708a]">ФОТ (год):</span>
                          <span className="text-white font-bold">
                            {(SPECIALISTS.find(s => s.id === selectedSpecialist)?.salary || 0 * 12).toLocaleString()} ₽
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/5 mt-4">
                      <div className="text-[10px] text-emerald-400 uppercase font-bold mb-1">Всего в первый год</div>
                      <div className="text-2xl font-heading font-bold text-white">
                        {(Object.entries(tierSelected).reduce((acc, [id, tier]) => {
                          const f = customFactors.find(cf => cf.id === id);
                          if (!f) return acc;
                          return acc + (tier === 'budget' ? f.budgetCost : tier === 'vip' ? f.vipCost : 0);
                        }, 0) + (SPECIALISTS.find(s => s.id === selectedSpecialist)?.salary || 0) * 12).toLocaleString()} ₽
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Info className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">Готово к расчету</h4>
                      <p className="text-xs text-[#62708a] leading-relaxed">
                        На основе выбранных стратегий защиты и квалификации персонала мы рассчитаем итоговый риск R_SME и финансовую эффективность внедрения мер.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-6 py-3 border border-[#1e2635] text-[#62708a] font-heading font-bold text-xs rounded-lg hover:text-white hover:border-white/20 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Назад
                </button>
                <button
                  onClick={calculate}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-400 text-black font-heading font-bold text-xs rounded-lg hover:bg-emerald-300 transition-all"
                >
                  Рассчитать <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && results && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Top Row: Core Security Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Risk Comparison Chart */}
                <div className="p-6 bg-[#0f1219] border border-[#1e2635] rounded-2xl flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Динамика рисков</span>
                      <h3 className="text-sm font-bold text-white mt-1">Интегральный риск (Z-Index)</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-heading font-bold text-emerald-400">
                        -{Math.round((1 - results.Z_after / results.Z_before) * 100)}%
                      </div>
                      <div className="text-[8px] text-[#62708a] uppercase font-bold">Снижение</div>
                    </div>
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Был риск', value: results.Z_before, fill: '#ef4444' },
                        { name: 'Стал риск', value: results.Z_after, fill: '#10b981' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2635" vertical={false} />
                        <XAxis dataKey="name" stroke="#62708a" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 10]} stroke="#62708a" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ backgroundColor: '#0f1219', border: '1px solid #1e2635', borderRadius: '8px' }}
                          itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                          { [0, 1].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#10b981'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-4 text-[10px] text-[#62708a] leading-relaxed italic">
                    * Снижение интегрального показателя угроз за счет внедрения выбранных эшелонов защиты.
                  </p>
                </div>

                {/* 2. Ease of Penetration Chart */}
                <div className="p-6 bg-[#0f1219] border border-[#1e2635] rounded-2xl flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Укрепление периметра</span>
                      <h3 className="text-sm font-bold text-white mt-1">Легкость проникновения</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-heading font-bold text-blue-400">
                        -{Math.round((1 - results.easeAfter / results.easeBefore) * 100)}%
                      </div>
                      <div className="text-[8px] text-[#62708a] uppercase font-bold">Усложнение</div>
                    </div>
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Была легкость', value: results.easeBefore, fill: '#f59e0b' },
                        { name: 'Стала легкость', value: results.easeAfter, fill: '#3b82f6' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2635" vertical={false} />
                        <XAxis dataKey="name" stroke="#62708a" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 10]} stroke="#62708a" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ backgroundColor: '#0f1219', border: '1px solid #1e2635', borderRadius: '8px' }}
                          itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                          { [0, 1].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : '#3b82f6'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-4 text-[10px] text-[#62708a] leading-relaxed italic">
                    * Показывает, насколько сложнее стало злоумышленнику преодолеть систему защиты.
                  </p>
                </div>
              </div>

              {/* Security Index & Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-[#0f1219] border border-[#1e2635] rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 opacity-5">
                    <ShieldCheck className="w-40 h-40" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#62708a] mb-4">Индекс R_SME</span>
                  <div className={`text-6xl font-heading font-black mb-4 ${getRiskLevel(results.R_SME).color}`}>
                    {Math.round(results.R_SME * 100)}%
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase border ${getRiskLevel(results.R_SME).bg} ${getRiskLevel(results.R_SME).color} ${getRiskLevel(results.R_SME).border}`}>
                    {getRiskLevel(results.R_SME).label} риск
                  </div>
                </div>

                <div className="lg:col-span-2 p-8 bg-[#0f1219] border border-[#1e2635] rounded-2xl flex flex-col justify-center">
                  <h3 className="text-lg font-heading font-bold text-white mb-4">Понятное резюме</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-bold">Эффективность защиты</p>
                        <p className="text-xs text-[#62708a]">
                          Внедрение мер позволило снизить вероятность успешной атаки на <span className="text-emerald-400 font-bold">{Math.round((1 - results.R_SME) * 100)}%</span>. 
                          Ваша система теперь значительно устойчивее к фишингу и шифровальщикам.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-bold">Экономическая выгода</p>
                        <p className="text-xs text-[#62708a]">
                          Предотвращенный потенциальный ущерб составляет <span className="text-blue-400 font-bold">{Math.round(results.initialDamage - results.totalDamage).toLocaleString()} ₽</span> в год. 
                          Это в <span className="text-white font-bold">{( (results.initialDamage - results.totalDamage) / (results.totalCost + results.specialistSalary * 12) ).toFixed(1)} раза</span> превышает годовые затраты на ИБ.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Financial & Contextual Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Financial Impact Card */}
                <div className="p-8 bg-[#0f1219] border border-[#1e2635] rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <CreditCard className="w-32 h-32" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#62708a] mb-6">Финансовый результат (Годовой прогноз)</div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <div className="text-[9px] text-[#62708a] uppercase font-bold mb-1">Ущерб БЕЗ защиты (L18)</div>
                        <div className="text-2xl font-heading font-bold text-red-400">
                          {Math.round(results.initialDamage).toLocaleString()} ₽
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-[#62708a] uppercase font-bold mb-1">Ущерб ПОСЛЕ мер</div>
                        <div className="text-2xl font-heading font-bold text-emerald-400">
                          {Math.round(results.totalDamage).toLocaleString()} ₽
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs text-[#62708a]">Стоимость внедрения мер</span>
                        <span className="text-sm font-bold text-white">{results.totalCost.toLocaleString()} ₽</span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs text-[#62708a]">Годовой ФОТ специалиста</span>
                        <span className="text-sm font-bold text-white">{(results.specialistSalary * 12).toLocaleString()} ₽</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-white/10">
                        <span className="text-sm text-white font-bold">Итого затраты на ИБ</span>
                        <div className="text-right">
                          <div className="text-xl font-heading font-bold text-blue-400">
                            {(results.totalCost + results.specialistSalary * 12).toLocaleString()} ₽
                          </div>
                          <div className="text-[8px] text-[#62708a] uppercase font-bold">в первый год</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Market & Operations Card */}
                <div className="p-8 bg-[#0f1219] border border-[#1e2635] rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Network className="w-32 h-32" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#62708a] mb-6">Контекст и Операции</div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-[9px] text-[#62708a] uppercase font-bold mb-1">Тип рынка</div>
                        <div className="text-sm font-bold text-white">
                          {results.marketType === 'duopoly' ? 'Дуополия' : 
                           results.marketType === 'oligopoly' ? 'Олигополия' : 
                           results.marketType === 'perfect' ? 'Совершенная конкуренция' : '—'}
                        </div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-[9px] text-[#62708a] uppercase font-bold mb-1">Конкуренция</div>
                        <div className="text-sm font-bold text-white">
                          {results.competitorRange === '1-2' ? 'Низкая (1-2)' : 
                           results.competitorRange === '3-10' ? 'Средняя (3-10)' : 
                           results.competitorRange === '11+' ? 'Высокая (11+)' : '—'}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-red-500/5 rounded-xl border border-red-500/10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                          <ShieldAlert className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                          <div className="text-[9px] text-red-400 uppercase font-bold">Простой фирмы (K18/K19)</div>
                          <div className="text-lg font-heading font-bold text-white">
                            {results.initialDowntime ? Math.round(results.initialDowntime) : 0} ч → {Math.round(results.totalDowntime)} ч
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#62708a] leading-relaxed">
                        {results.totalDowntime > 24 
                          ? 'Критический простой. Требуется внедрение мер отказоустойчивости и резервного копирования.' 
                          : 'Допустимый уровень простоя при текущей стратегии защиты.'}
                      </p>
                    </div>

                    <div className="flex justify-center pt-4">
                      <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all"
                      >
                        <CreditCard className="w-3" /> Скачать PDF отчет
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {selectedObjects.length > 0 && (
                <div className="p-6 bg-[#0f1219] border border-[#1e2635] rounded-2xl">
                  <div className="text-[10px] uppercase tracking-widest text-[#62708a] mb-4 font-bold">Защищаемые активы</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedObjects.map(objId => {
                      const obj = PROTECTION_OBJECTS.find(o => o.id === objId);
                      if (!obj) return null;
                      return (
                        <div key={objId} className="flex items-center gap-2 px-3 py-2 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                          <div className="text-violet-400">{obj.icon}</div>
                          <span className="text-[11px] font-bold text-white/80">{obj.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-6 bg-white/5 border border-white/10 rounded-xl text-sm leading-relaxed text-[#62708a]">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <strong className="text-white block mb-2">Интерпретация:</strong>
                    {results.R_SME < 0.3 ? (
                      "Ваша система находится в зоне безопасности. Выбранные меры защиты эффективно перекрывают актуальные угрозы. Рекомендуется проводить плановый аудит раз в полгода."
                    ) : results.R_SME < 0.6 ? (
                      "Средний уровень риска. Имеются уязвимые места в архитектуре или процессах. Рекомендуется усилить контроль целостности и провести дополнительное обучение персонала."
                    ) : (
                      "Критический уровень риска! Ваша инфраструктура крайне уязвима для современных киберугроз. Необходим срочный пересмотр политики безопасности и внедрение PAM/SIEM систем."
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <div className="text-[8px] font-bold uppercase tracking-widest text-blue-400">Рекомендовано</div>
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <User className="w-8 h-8" />
                    </div>
                    <div className="text-[9px] font-bold text-center text-white leading-tight">
                      {SPECIALISTS[3].label}<br/>
                      <span className="text-blue-400">для -25% риска</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-[#0f1219] border border-[#1e2635] rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                  <FileText className="w-40 h-40" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <FileText className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-bold text-white">Методология калькулятора</h3>
                      <p className="text-[10px] text-[#62708a] uppercase tracking-widest font-bold">Математический аппарат и база знаний</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="text-xs font-bold text-white/80 border-b border-white/5 pb-2">Реестр расчетных модулей:</div>
                      <div className="grid grid-cols-1 gap-2">
                        {METHODOLOGY_FILES.map((file, i) => (
                          <button 
                            key={i} 
                            onClick={() => setSelectedMethodFile(file)}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all group text-left w-full"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:animate-pulse" />
                              <span className="text-[11px] font-mono text-emerald-400">{file.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-[#62708a] italic">{file.desc}</span>
                              <Eye className="w-3 h-3 text-[#2e3a50] group-hover:text-emerald-400 transition-colors" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 mb-4">
                        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3">Научная база</div>
                        <p className="text-[11px] text-[#62708a] leading-relaxed">
                          Расчет производится на основе 16-факторной модели угроз, разработанной на кафедре ОТЗИ СКФУ. 
                          Модель учитывает синергетический эффект внедрения мер защиты и динамику изменения ландшафта угроз в периоде 2025–2026 гг.
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Database className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="text-[9px] text-[#62708a] leading-tight">
                          Все формулы соответствуют ГОСТ Р ИСО/МЭК 27005 и методикам ФСТЭК России по оценке угроз безопасности информации.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep(1);
                  setResults(null);
                  setSelectedSector(null);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[#161b25] text-white font-heading font-bold text-xs rounded-lg hover:bg-[#1e2635] transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Начать заново
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-20 pt-10 border-t border-white/5 text-center">
          <p className="text-[10px] text-[#2e3a50] uppercase tracking-[0.2em] font-bold">
            Разработано в СКФУ · Кафедра ОТЗИ · 2026
          </p>
        </footer>
      </div>
    </div>
  );
}
