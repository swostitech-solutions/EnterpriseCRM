/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  FileText, 
  Terminal, 
  Settings, 
  Cloud, 
  Database, 
  ShieldCheck, 
  Layers, 
  Code 
} from 'lucide-react';

export default function DocumentationView() {
  return (
    <div className="space-y-6" id="documentation-view-container">
      {/* Documentation Title Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs" id="documentation-header">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" /> Platform Deployment & Source Code Guide
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Complete structural guide, system variables blueprint, and instructions for scaling and deploying to Google Cloud Run.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="documentation-grid">
        {/* Left column: Architecture & Variables (2 cols) */}
        <div className="lg:col-span-2 space-y-6" id="doc-main-content">
          {/* Section 1: Stack Architecture */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3" id="doc-architecture">
            <h3 className="text-md font-bold text-slate-950 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Layers className="w-4 h-4 text-indigo-600" /> 1. System Code Architecture
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This Enterprise CRM is engineered with a modular, scalable React SPA architecture leveraging Vite and TypeScript. State is managed reactively and synced to a localized browser database for complete persistence across sessions.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1">
              <div className="text-indigo-600 font-bold">// Source Directory Layout</div>
              <div>/src/types.ts                 <span className="text-slate-400">// Centralized entities and seed datasets</span></div>
              <div>/src/components/Sidebar.tsx     <span className="text-slate-400">// Fluid navigation panel</span></div>
              <div>/src/components/ClientManager.tsx <span className="text-slate-400">// Client lifecycles, tags, & notes</span></div>
              <div>/src/components/CalendarScheduler.tsx <span className="text-slate-400">// Date-based scheduling engine</span></div>
              <div>/src/components/InventoryManager.tsx <span className="text-slate-400">// Stock catalog with threshold alert levels</span></div>
              <div>/src/components/SalesPipeline.tsx <span className="text-slate-400">// Kanban stage progression & valuation board</span></div>
              <div>/src/components/BillingInvoice.tsx <span className="text-slate-400">// Itemized billing, calculations & printable receipts</span></div>
              <div>/src/components/RoleManagement.tsx <span className="text-slate-400">// Staff directory & Live Switcher Testing platform</span></div>
              <div>/src/components/AnalyticsReports.tsx <span className="text-slate-400">// Reports & BI dashboard (Recharts integration)</span></div>
              <div>/src/App.tsx                   <span className="text-slate-400">// Core state orchestrator & local storage bridge</span></div>
            </div>
          </div>

          {/* Section 2: Deployment Manual */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3" id="doc-deployment">
            <h3 className="text-md font-bold text-slate-950 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Cloud className="w-4 h-4 text-indigo-600" /> 2. Google Cloud Run Deployment
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The application compiles into an optimized static bundle that can be instantly hosted in containerized architectures like Google Cloud Run or cloud buckets. Follow these CLI operations:
            </p>
            
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase block mb-1">A. Local Compilation & Testing</span>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] space-y-1">
                  <div># 1. Install dependencies from manifest</div>
                  <div className="text-emerald-400">npm install</div>
                  <div># 2. Boot development server at port 3000</div>
                  <div className="text-emerald-400">npm run dev</div>
                  <div># 3. Compile optimized production build folder (dist/)</div>
                  <div className="text-emerald-400">npm run build</div>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800 uppercase block mb-1">B. Building Container Image with Docker</span>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] space-y-1">
                  <div># Build Docker container targeting production static server</div>
                  <div className="text-emerald-400">docker build -t gcr.io/your-project-id/enterprise-crm:latest .</div>
                  <div># Push image to Google Container Registry (GCR)</div>
                  <div className="text-emerald-400">docker push gcr.io/your-project-id/enterprise-crm:latest</div>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800 uppercase block mb-1">C. Deploying via gcloud SDK to Cloud Run</span>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] space-y-1">
                  <div># Deploy image directly onto Cloud Run with ingress port 3000 routing</div>
                  <div className="text-emerald-400">gcloud run deploy enterprise-crm-service \</div>
                  <div className="text-emerald-400">  --image gcr.io/your-project-id/enterprise-crm:latest \</div>
                  <div className="text-emerald-400">  --platform managed \</div>
                  <div className="text-emerald-400">  --region us-central1 \</div>
                  <div className="text-emerald-400">  --allow-unauthenticated \</div>
                  <div className="text-emerald-400">  --port 3000</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Config & Database Spec */}
        <div className="space-y-6" id="doc-side-content">
          {/* Section 3: Environment Configuration */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3" id="doc-env-config">
            <h3 className="text-md font-bold text-slate-950 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Settings className="w-4 h-4 text-indigo-600" /> Environment Variables
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Environment settings are configured inside `.env`. Create a copy of `.env.example` as `.env` and fill:
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-700 space-y-2">
              <div>
                <strong className="text-indigo-600">APP_URL=</strong>"MY_APP_URL"
                <span className="block text-slate-400 text-[9px] mt-0.5">// Ingress URL where CRM service is active</span>
              </div>
              <div>
                <strong className="text-indigo-600">PORT=</strong>3000
                <span className="block text-slate-400 text-[9px] mt-0.5">// Mandatory ingress port for reverse proxies</span>
              </div>
              <div>
                <strong className="text-indigo-600">GEMINI_API_KEY=</strong>"MY_GEMINI_KEY"
                <span className="block text-slate-400 text-[9px] mt-0.5">// Key for smart enterprise summaries (server-side only)</span>
              </div>
            </div>
          </div>

          {/* Section 4: Database Sync Schema */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3" id="doc-db-spec">
            <h3 className="text-md font-bold text-slate-950 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Database className="w-4 h-4 text-indigo-600" /> Offline Sync DB Design
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To guarantee bulletproof offline resilience and speed, the platform uses a <strong>localStorage bridge</strong>.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Immediate Save</strong>: State transitions instantly trigger writes to browser Storage, meaning cache clearings are avoided.
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Automatic Seeding</strong>: If local storage is empty, realistic data is instantiated, preventing empty screen flashes.
                </span>
              </div>
            </div>
          </div>

          {/* Section 5: Secure Permission checks */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3" id="doc-security">
            <h3 className="text-md font-bold text-slate-950 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Code className="w-4 h-4 text-indigo-600" /> Security Checkpoints
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every action is gated dynamically on the active user's credentials. For example, staff actions are coded as:
            </p>
            <div className="bg-slate-900 text-indigo-300 p-3 rounded-lg font-mono text-[10px] space-y-1">
              <div>{"// Security Checkpoints in React code"}</div>
              <div className="text-emerald-400">{"if (currentUser.role !== 'Admin') {"}</div>
              <div className="text-slate-400">{"  throw new Error('Access Denied');"}</div>
              <div className="text-emerald-400">{"}"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
