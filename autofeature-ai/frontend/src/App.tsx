import { useState, useEffect } from "react";
import {
  Database,
  Sparkles,
  BarChart3,
  Brain,
  Cpu,
  Trophy,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Table2,
  Zap,
  FileText,
  ArrowRight,
  ArrowDown,
  Layers,
  Shield,
  GitMerge,
  Info,
} from "lucide-react";
import type {
  TableInfo,
  LLMFeature,
  FTFeature,
  RankedFeature,
  GenerateResult,
} from "./types";

/* ------------------------------------------------------------------ */
/* Sidebar                                                             */
/* ------------------------------------------------------------------ */
function Sidebar({ step }: { step: number }) {
  const items = [
    { icon: Table2, label: "テーブル選択", idx: 1 },
    { icon: Cpu, label: "特徴量生成", idx: 2 },
    { icon: Trophy, label: "結果表示", idx: 3 },
  ];
  return (
    <aside className="w-64 bg-databricks-sidebar text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-databricks-red flex items-center justify-center">
            <Zap size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">AutoFeature AI</h1>
            <p className="text-xs text-gray-400">自動特徴量エンジニアリング</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {items.map((it) => {
          const active = step === it.idx;
          const done = step > it.idx;
          return (
            <div
              key={it.idx}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : done
                  ? "text-green-400"
                  : "text-gray-500"
              }`}
            >
              {done ? (
                <CheckCircle2 size={18} />
              ) : (
                <it.icon size={18} />
              )}
              <span className="text-sm font-medium">{it.label}</span>
              {active && <ChevronRight size={14} className="ml-auto" />}
            </div>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-gray-500">
          Powered by Databricks
          <br />
          Claude + Featuretools
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Architecture Diagram                                                */
/* ------------------------------------------------------------------ */
function ArchitectureDiagram() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mb-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-databricks-red transition-colors mb-3"
      >
        <Layers size={16} />
        <span className="font-medium">アーキテクチャを見る</span>
        <ChevronRight size={14} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>
      {expanded && (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 overflow-x-auto">
          <svg viewBox="0 0 820 420" className="w-full max-w-4xl mx-auto" style={{ minWidth: 600 }}>
            {/* Background */}
            <defs>
              <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF3621" />
                <stop offset="100%" stopColor="#FF6B35" />
              </linearGradient>
              <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
              <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
              <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
              <filter id="shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
              </filter>
            </defs>

            {/* Title */}
            <text x="410" y="28" textAnchor="middle" className="text-sm" fill="#374151" fontWeight="bold" fontSize="15">AutoFeature AI — システムアーキテクチャ</text>

            {/* --- Row 1: App UI --- */}
            <rect x="220" y="45" width="380" height="55" rx="12" fill="url(#redGrad)" filter="url(#shadow)" />
            <text x="410" y="68" textAnchor="middle" fill="white" fontWeight="bold" fontSize="13">Databricks Apps</text>
            <text x="410" y="88" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="11">AutoFeature AI UI（React + FastAPI）</text>

            {/* Arrow down */}
            <line x1="410" y1="100" x2="410" y2="130" stroke="#9CA3AF" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <defs><marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#9CA3AF"/></marker></defs>

            {/* --- Row 2: Feature Generation Engine --- */}
            <rect x="60" y="135" width="700" height="120" rx="12" fill="white" stroke="#E5E7EB" strokeWidth="2" filter="url(#shadow)" />
            <text x="410" y="158" textAnchor="middle" fill="#374151" fontWeight="bold" fontSize="12">Feature Generation Engine</text>

            {/* LLM Agent box */}
            <rect x="90" y="170" width="280" height="65" rx="8" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5" />
            <circle cx="115" cy="195" r="14" fill="url(#blueGrad)" />
            <text x="115" y="200" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">AI</text>
            <text x="240" y="195" textAnchor="middle" fill="#1E40AF" fontWeight="bold" fontSize="12">LLM Agent（Claude）</text>
            <text x="240" y="215" textAnchor="middle" fill="#6B7280" fontSize="10">ドメイン知識ベースの特徴量提案</text>
            <text x="240" y="228" textAnchor="middle" fill="#9CA3AF" fontSize="9">Foundation Model API</text>

            {/* Featuretools box */}
            <rect x="450" y="170" width="280" height="65" rx="8" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1.5" />
            <circle cx="475" cy="195" r="14" fill="url(#greenGrad)" />
            <text x="475" y="200" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">FT</text>
            <text x="600" y="195" textAnchor="middle" fill="#065F46" fontWeight="bold" fontSize="12">Featuretools (OSS)</text>
            <text x="600" y="215" textAnchor="middle" fill="#6B7280" fontSize="10">Deep Feature Synthesis</text>
            <text x="600" y="228" textAnchor="middle" fill="#9CA3AF" fontSize="9">統計的・数学的特徴量の網羅的生成</text>

            {/* Merge arrow */}
            <path d="M 230 240 L 230 270 Q 230 280 240 280 L 400 280" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeDasharray="4 2" />
            <path d="M 590 240 L 590 270 Q 590 280 580 280 L 420 280" stroke="#10B981" strokeWidth="1.5" fill="none" strokeDasharray="4 2" />

            {/* --- Row 3: Feature Ranker --- */}
            <rect x="280" y="268" width="260" height="45" rx="10" fill="url(#purpleGrad)" filter="url(#shadow)" />
            <text x="410" y="288" textAnchor="middle" fill="white" fontWeight="bold" fontSize="12">Feature Ranker</text>
            <text x="410" y="303" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="10">相関分析 + 重要度スコアリング</text>

            {/* Arrow down */}
            <line x1="410" y1="313" x2="410" y2="340" stroke="#9CA3AF" strokeWidth="2" markerEnd="url(#arrowhead)" />

            {/* --- Row 4: Data Layer --- */}
            <rect x="60" y="345" width="700" height="65" rx="12" fill="#FAFAFA" stroke="#E5E7EB" strokeWidth="2" filter="url(#shadow)" />
            <text x="130" y="370" textAnchor="middle" fill="#374151" fontWeight="bold" fontSize="11">Unity Catalog</text>

            {/* Table icons */}
            {["customers", "transactions", "payments", "credit_apps"].map((t, i) => (
              <g key={t}>
                <rect x={230 + i * 125} y={355} width={110} height={35} rx="6" fill="white" stroke="#D1D5DB" strokeWidth="1" />
                <text x={285 + i * 125} y={377} textAnchor="middle" fill="#6B7280" fontSize="10">{t}</text>
              </g>
            ))}

            {/* Feature Store label */}
            <text x="130" y="395" textAnchor="middle" fill="#9CA3AF" fontSize="9">+ Feature Store</text>
          </svg>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>LLM（創造的特徴量）</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Featuretools（網羅的特徴量）</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span>重要度ランキング</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* How It Works                                                        */
/* ------------------------------------------------------------------ */
function HowItWorks() {
  const steps = [
    {
      icon: Database,
      color: "bg-red-100 text-databricks-red",
      title: "テーブルを選択",
      desc: "Unity Catalogから特徴量生成に使うテーブルを選びます。テーブル間のリレーションはcustomer_idで自動検出されます。",
    },
    {
      icon: Brain,
      color: "bg-blue-100 text-blue-600",
      title: "AIが特徴量を自動生成",
      desc: "LLM（Claude）がドメイン知識を活用して高品質な特徴量を提案。同時にFeaturetoolsが数学的・統計的な特徴量を網羅的に生成します。",
    },
    {
      icon: Trophy,
      color: "bg-purple-100 text-purple-600",
      title: "重要度でランキング",
      desc: "生成された全特徴量をターゲット変数との相関で自動評価。予測力の高い順にランキングし、サマリーレポートも生成します。",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Info size={16} className="text-gray-400" />
        <h3 className="font-semibold text-gray-700 text-sm">AutoFeature AI の仕組み</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-3">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center flex-shrink-0`}>
              <s.icon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-400">STEP {i + 1}</span>
                {i < steps.length - 1 && <ArrowRight size={12} className="text-gray-300 hidden md:block" />}
              </div>
              <h4 className="font-semibold text-gray-800 text-sm mb-1">{s.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1 – Table Selection                                            */
/* ------------------------------------------------------------------ */
function TableSelection({
  tables,
  selected,
  onToggle,
  targetColumn,
  onGenerate,
  loading,
}: {
  tables: TableInfo[];
  selected: Set<string>;
  onToggle: (name: string) => void;
  targetColumn: string;
  onGenerate: () => void;
  loading: boolean;
}) {
  const tableDescriptions: Record<string, string> = {
    customers: "顧客の基本属性情報（年齢、収入、雇用形態、住所等）",
    transactions: "クレジットカードの取引履歴（金額、加盟店、取引種別等）",
    payments: "月次の支払い履歴（請求額、支払額、遅延日数等）",
    credit_applications: "与信申請情報（希望限度額、信用スコア、承認結果）",
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          自動特徴量エンジニアリング
        </h2>
        <p className="text-gray-500 mt-1">
          複数テーブルを選択するだけで、AIが数百の特徴量候補を自動生成・評価します
        </p>
      </div>

      {/* Mission context */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-amber-600" />
          <h3 className="font-semibold text-amber-800 text-sm">デモのミッション・前提条件</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">ユースケース</p>
            <p className="text-gray-700">与信審査モデルの特徴量を自動発見・生成する</p>
          </div>
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">予測ターゲット</p>
            <p className="text-gray-700">
              <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-800 font-mono text-xs">credit_applications.approved_flag</code>
              <span className="block mt-1 text-gray-500 text-xs">与信審査の承認 / 否決（二値分類）</span>
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">最大化する指標</p>
            <p className="text-gray-700">
              <span className="font-semibold text-amber-800">AUC（ROC曲線下面積）</span>
              <span className="block mt-1 text-gray-500 text-xs">自動生成特徴量 vs 手動設計特徴量で比較</span>
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <HowItWorks />

      {/* Architecture diagram */}
      <ArchitectureDiagram />

      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <Database size={16} className="text-gray-400" />
        <h3 className="font-semibold text-gray-700 text-sm">Unity Catalog テーブル</h3>
        <span className="text-xs text-gray-400">— 特徴量生成に使用するテーブルを選択してください</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {tables.map((t) => {
          const isSelected = selected.has(t.name);
          const isTarget = t.name === "credit_applications";
          const desc = tableDescriptions[t.name] || "";
          return (
            <button
              key={t.name}
              onClick={() => onToggle(t.name)}
              className={`text-left p-5 rounded-xl border-2 transition-all hover:shadow-md ${
                isSelected
                  ? "border-databricks-red bg-red-50/50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Database
                    size={18}
                    className={isSelected ? "text-databricks-red" : "text-gray-400"}
                  />
                  <span className="font-semibold text-gray-800">{t.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isTarget && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      ターゲット
                    </span>
                  )}
                  {isSelected && (
                    <CheckCircle2 size={18} className="text-databricks-red" />
                  )}
                </div>
              </div>
              {desc && (
                <p className="text-xs text-gray-500 mb-3 ml-7">{desc}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {t.columns.map((c) => (
                  <span
                    key={c.name}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      c.name === targetColumn && isTarget
                        ? "bg-amber-200 text-amber-800 font-medium"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.name}
                    <span className="text-gray-400 ml-0.5">
                      {c.type.toLowerCase().replace("string", "str")}
                    </span>
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Relationship hint */}
      <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
        <GitMerge size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">テーブル間のリレーション</p>
          <p className="text-xs text-blue-600 mt-1">
            全テーブルは <code className="bg-blue-100 px-1 rounded">customer_id</code> で結合されます。
            AutoFeature AIはこのリレーションを自動検出し、テーブル間をまたぐ集約・比率・傾向などの複合特徴量を生成します。
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400">
          <Loader2 className="animate-spin inline mr-2" size={16} />
          テーブル情報を読み込み中...
        </div>
      ) : (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-5">
          <div>
            <p className="text-sm text-gray-500">
              選択済み: <strong className="text-gray-800">{selected.size}テーブル</strong>
              {" / "}ターゲット:{" "}
              <strong className="text-amber-600">
                credit_applications.{targetColumn}
              </strong>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              LLM（Claude）とFeaturetoolsが並行して特徴量を生成します
            </p>
          </div>
          <button
            onClick={onGenerate}
            disabled={selected.size === 0}
            className="flex items-center gap-2 bg-databricks-red text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles size={18} />
            特徴量を自動生成
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 – Generation Progress                                        */
/* ------------------------------------------------------------------ */
function GenerationProgress({
  statusMessages,
  progress,
}: {
  statusMessages: string[];
  progress: number;
}) {
  return (
    <div className="max-w-2xl mx-auto mt-16">
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-full bg-databricks-red/10 flex items-center justify-center mx-auto mb-4">
          <Brain size={36} className="text-databricks-red animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">特徴量を生成中...</h2>
        <p className="text-gray-500 mt-1">
          LLMとFeaturetoolsが並行して特徴量を生成しています
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-gray-200 rounded-full h-3 mb-8 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-databricks-red to-orange-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        >
          <div className="w-full h-full shimmer" />
        </div>
      </div>

      {/* Status messages */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 mb-6">
        {statusMessages.map((msg, i) => (
          <div key={i} className="flex items-start gap-3">
            {i === statusMessages.length - 1 ? (
              <Loader2
                size={16}
                className="text-databricks-red animate-spin mt-0.5 flex-shrink-0"
              />
            ) : (
              <CheckCircle2
                size={16}
                className="text-green-500 mt-0.5 flex-shrink-0"
              />
            )}
            <span
              className={`text-sm ${
                i === statusMessages.length - 1
                  ? "text-gray-800 font-medium"
                  : "text-gray-500"
              }`}
            >
              {msg}
            </span>
          </div>
        ))}
      </div>

      {/* What's happening */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={16} className="text-blue-600" />
            <h4 className="font-semibold text-blue-800 text-sm">LLM Agent（Claude）</h4>
          </div>
          <p className="text-xs text-blue-700 leading-relaxed">
            テーブル構造とカラム名を分析し、与信審査ドメインの知識を活用して「支払い遅延の加速度」「キャッシング比率」など、人間のデータサイエンティストが思いつくような創造的な特徴量を提案します。
          </p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={16} className="text-emerald-600" />
            <h4 className="font-semibold text-emerald-800 text-sm">Featuretools（OSS）</h4>
          </div>
          <p className="text-xs text-emerald-700 leading-relaxed">
            Deep Feature Synthesis アルゴリズムにより、テーブル間の結合・集約・変換パターンを網羅的に探索。SUM、MEAN、COUNT、STD等の統計的特徴量を自動で大量生成します。
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 – Results                                                    */
/* ------------------------------------------------------------------ */
type Tab = "llm" | "featuretools" | "ranking" | "report";

function Results({ result }: { result: GenerateResult }) {
  const [tab, setTab] = useState<Tab>("ranking");
  const [report, setReport] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const handleReportTab = async () => {
    setTab("report");
    if (report) return;
    setReportLoading(true);
    try {
      const resp = await fetch("/api/summary-report", { method: "POST" });
      const data = await resp.json();
      setReport(data.report);
    } catch {
      setReport("レポートの生成に失敗しました。再度お試しください。");
    } finally {
      setReportLoading(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType; count?: number; onClick?: () => void }[] = [
    { key: "ranking", label: "重要度ランキング", icon: Trophy, count: Math.min(result.ranked_features.length, 20) },
    { key: "llm", label: "LLM提案特徴量", icon: Brain, count: result.llm_features.length },
    { key: "featuretools", label: "自動生成特徴量", icon: Cpu, count: result.featuretools_features.length },
    { key: "report", label: "サマリーレポート", icon: FileText, onClick: handleReportTab },
  ];

  return (
    <div>
      {/* Summary banner */}
      <div className="bg-gradient-to-r from-databricks-red to-orange-500 rounded-xl p-5 text-white mb-6">
        <div className="flex items-center gap-3">
          <Sparkles size={24} />
          <div>
            <h2 className="font-bold text-lg">生成完了</h2>
            <p className="text-white/80 text-sm">{result.summary}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => t.onClick ? t.onClick() : setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
              tab === t.key
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <t.icon size={16} />
            {t.label}
            {t.count !== undefined && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? "bg-databricks-red text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "ranking" && <RankingTab features={result.ranked_features} />}
      {tab === "llm" && <LLMTab features={result.llm_features} />}
      {tab === "featuretools" && <FTTab features={result.featuretools_features} />}
      {tab === "report" && <ReportTab report={report} loading={reportLoading} />}
    </div>
  );
}

function RankingTab({ features }: { features: RankedFeature[] }) {
  const top20 = features.slice(0, 20);
  const maxImportance = top20.length > 0 ? top20[0].importance : 1;
  const llmCount = top20.filter(f => f.source === "LLM").length;
  const ftCount = top20.filter(f => f.source === "Featuretools").length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-800 mb-1">
        Top 20 特徴量（重要度スコア順）
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        青色 = LLM提案、緑色 = Featuretools自動生成
      </p>
      <div className="flex gap-4 mb-5">
        <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-xs text-blue-700 font-medium">LLM: {llmCount}個</span>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-emerald-700 font-medium">Featuretools: {ftCount}個</span>
        </div>
        <div className="text-xs text-gray-400 flex items-center">
          ※ ホバーで各特徴量の説明を表示
        </div>
      </div>
      <div className="space-y-2.5">
        {top20.map((f, i) => {
          const pct = (f.importance / maxImportance) * 100;
          const isLLM = f.source === "LLM";
          return (
            <div key={i} className="group">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-5 text-right font-mono">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {f.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        isLLM
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {f.source}
                    </span>
                  </div>
                  <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isLLM
                          ? "bg-gradient-to-r from-blue-400 to-blue-600"
                          : "bg-gradient-to-r from-emerald-400 to-emerald-600"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-mono text-gray-600 w-14 text-right">
                  {f.importance.toFixed(3)}
                </span>
              </div>
              {f.description && (
                <p className="text-xs text-gray-400 ml-8 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                  {f.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LLMTab({ features }: { features: LLMFeature[] }) {
  return (
    <div>
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 mb-4">
        <div className="flex items-start gap-3">
          <Brain size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">LLM（Claude）が提案した特徴量</p>
            <p className="text-xs text-blue-600 mt-1">
              Databricks Foundation Model API経由でClaude（databricks-claude-sonnet-4）がテーブルスキーマを分析し、
              与信審査ドメインの知識を活用して提案した特徴量です。各特徴量にはSQL式と日本語の説明が付与されています。
              従来はベテランデータサイエンティストが数日〜数週間かけて設計していた作業を数秒で実行します。
            </p>
          </div>
        </div>
      </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {features.map((f, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-gray-800 text-sm">{f.name}</h4>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2">
              重要度 {f.importance.toFixed(3)}
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 mb-3 font-mono text-xs text-gray-600 overflow-x-auto">
            {f.sql}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {f.explanation}
          </p>
        </div>
      ))}
    </div>
    </div>
  );
}

function FTTab({ features }: { features: FTFeature[] }) {
  return (
    <div>
      <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4 mb-4">
        <div className="flex items-start gap-3">
          <Cpu size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-800">Featuretoolsが自動生成した特徴量</p>
            <p className="text-xs text-emerald-600 mt-1">
              OSS（Featuretools）のDeep Feature Synthesis（DFS）アルゴリズムが、テーブル間のリレーションを辿りながら
              SUM、MEAN、COUNT、STD、MAX、MIN等の集約関数を組み合わせて網羅的に特徴量を生成しました。
              人手では試しきれない大量の組み合わせパターンを機械的に探索しています。
            </p>
          </div>
        </div>
      </div>
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-5 py-3 font-medium text-gray-500">#</th>
            <th className="text-left px-5 py-3 font-medium text-gray-500">
              特徴量名
            </th>
            <th className="text-left px-5 py-3 font-medium text-gray-500">タイプ</th>
            <th className="text-right px-5 py-3 font-medium text-gray-500">
              重要度
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((f, i) => (
            <tr
              key={i}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="px-5 py-2.5 text-gray-400 font-mono text-xs">
                {i + 1}
              </td>
              <td className="px-5 py-2.5 font-medium text-gray-700 font-mono text-xs">
                {f.name}
              </td>
              <td className="px-5 py-2.5 text-gray-500 text-xs">{f.type}</td>
              <td className="px-5 py-2.5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${f.importance * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-gray-600 w-10 text-right">
                    {f.importance.toFixed(3)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Report Tab                                                          */
/* ------------------------------------------------------------------ */
function ReportTab({ report, loading }: { report: string | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
          <FileText size={28} className="text-purple-500 animate-pulse" />
        </div>
        <h3 className="font-semibold text-gray-800 mb-2">サマリーレポートを生成中...</h3>
        <p className="text-sm text-gray-500">LLMが結果を分析し、レポートを作成しています</p>
        <Loader2 size={20} className="text-purple-500 animate-spin mx-auto mt-4" />
      </div>
    );
  }

  if (!report) return null;

  // Simple markdown rendering
  const renderMarkdown = (md: string) => {
    return md.split("\n").map((line, i) => {
      // H2
      if (line.startsWith("## ")) {
        return <h2 key={i} className="text-xl font-bold text-gray-800 mt-8 mb-3 pb-2 border-b border-gray-200">{line.replace("## ", "")}</h2>;
      }
      // H3
      if (line.startsWith("### ")) {
        return <h3 key={i} className="text-lg font-semibold text-gray-700 mt-6 mb-2">{line.replace("### ", "")}</h3>;
      }
      // Table separator
      if (line.match(/^\|[-\s|:]+\|$/)) return null;
      // Table header/row
      if (line.startsWith("|")) {
        const cells = line.split("|").filter(c => c.trim());
        const isHeader = i + 1 < md.split("\n").length && md.split("\n")[i + 1]?.match(/^\|[-\s|:]+\|$/);
        return (
          <div key={i} className={`grid gap-0 ${cells.length === 3 ? "grid-cols-3" : cells.length === 2 ? "grid-cols-2" : "grid-cols-4"}`}>
            {cells.map((cell, j) => (
              <div key={j} className={`px-3 py-2 border border-gray-200 text-sm ${isHeader ? "bg-gray-50 font-semibold text-gray-700" : "text-gray-600"}`}>
                {renderInline(cell.trim())}
              </div>
            ))}
          </div>
        );
      }
      // Numbered list
      if (line.match(/^\d+\.\s/)) {
        const text = line.replace(/^\d+\.\s/, "");
        return <div key={i} className="flex gap-2 mb-2 ml-2"><span className="text-databricks-red font-semibold">{line.match(/^\d+/)![0]}.</span><span className="text-sm text-gray-700 leading-relaxed">{renderInline(text)}</span></div>;
      }
      // Bullet
      if (line.match(/^(\s*)-\s/)) {
        const indent = (line.match(/^(\s*)/)?.[1].length || 0) / 2;
        const text = line.replace(/^\s*-\s/, "");
        return <div key={i} className="flex gap-2 mb-1.5" style={{ marginLeft: `${indent * 16 + 8}px` }}><span className="text-gray-400 mt-1.5">•</span><span className="text-sm text-gray-700 leading-relaxed">{renderInline(text)}</span></div>;
      }
      // Empty line
      if (!line.trim()) return <div key={i} className="h-2" />;
      // Paragraph
      return <p key={i} className="text-sm text-gray-700 leading-relaxed mb-2">{renderInline(line)}</p>;
    });
  };

  const renderInline = (text: string) => {
    // Bold
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-gray-800">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <FileText size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">サマリーレポート</h3>
            <p className="text-xs text-gray-500">AI生成による分析レポート</p>
          </div>
        </div>
      </div>
      <div className="prose prose-sm max-w-none">
        {renderMarkdown(report)}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */
export default function App() {
  const [step, setStep] = useState(1);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(["customers", "transactions", "payments", "credit_applications"])
  );
  const [progress, setProgress] = useState(0);
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const targetColumn = "approved";

  // Load tables on mount
  useEffect(() => {
    fetch("/api/tables")
      .then((r) => r.json())
      .then((d) => {
        setTables(d.tables);
        setTablesLoading(false);
      })
      .catch(() => setTablesLoading(false));
  }, []);

  const toggleTable = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleGenerate = async () => {
    setStep(2);
    setProgress(0);
    setStatusMessages(["テーブルスキーマを分析中..."]);

    // Simulate progress updates
    const msgs = [
      { text: "テーブルスキーマを分析中...", at: 0 },
      { text: "LLM (Claude) に特徴量の提案を依頼中...", at: 10 },
      { text: "Featuretools で Deep Feature Synthesis を実行中...", at: 30 },
      { text: "特徴量の相関分析を計算中...", at: 60 },
      { text: "重要度スコアでランキング作成中...", at: 80 },
    ];

    let currentMsg = 0;
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 2, 90);
        if (currentMsg < msgs.length - 1 && next >= msgs[currentMsg + 1].at) {
          currentMsg++;
          setStatusMessages((prev) => [
            ...prev,
            msgs[currentMsg].text,
          ]);
        }
        return next;
      });
    }, 300);

    try {
      const resp = await fetch("/api/generate-features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tables: Array.from(selected),
          target_table: "credit_applications",
          target_column: targetColumn,
        }),
      });
      const data: GenerateResult = await resp.json();
      clearInterval(progressInterval);
      setProgress(100);
      setStatusMessages((prev) => [...prev, "完了しました！"]);
      setTimeout(() => {
        setResult(data);
        setStep(3);
      }, 800);
    } catch (err) {
      clearInterval(progressInterval);
      setStatusMessages((prev) => [...prev, "エラーが発生しました。"]);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar step={step} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <span>classic_stable_nud6b0</span>
                <ChevronRight size={12} />
                <span>credit_scoring</span>
              </div>
            </div>
            {step === 3 && (
              <button
                onClick={() => {
                  setStep(1);
                  setResult(null);
                }}
                className="text-sm text-databricks-red hover:underline"
              >
                最初からやり直す
              </button>
            )}
          </div>

          {/* Content */}
          {step === 1 && (
            <TableSelection
              tables={tables}
              selected={selected}
              onToggle={toggleTable}
              targetColumn={targetColumn}
              onGenerate={handleGenerate}
              loading={tablesLoading}
            />
          )}
          {step === 2 && (
            <GenerationProgress
              statusMessages={statusMessages}
              progress={progress}
            />
          )}
          {step === 3 && result && <Results result={result} />}
        </div>
      </main>
    </div>
  );
}
