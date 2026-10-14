import React from 'react';
import { Shield, Sparkles, Compass, Users } from 'lucide-react';

export const ScoutCharacterDossier: React.FC = () => {
  return (
    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-400" />
            <span>Karakter Pramuka & Nilai Kolaborasi</span>
          </h3>
          <p className="text-xs text-slate-400">
            Profil ketiga pandu pramuka dalam cerita sinematik "Pos Benteng Kosong"
          </p>
        </div>
        <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-500/40">
          Gerakan Pramuka Indonesia
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-amber-500/40">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/20 text-xs font-black text-red-400">
              C
            </span>
            <div>
              <h4 className="text-sm font-bold text-white">Candra</h4>
              <p className="text-[11px] text-amber-400">Pramuka Penggalang • Rambut Lurus</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-300">
            Semangat juang tinggi dan bangga karena tiba lebih dahulu di Pos Benteng Kosong. Memegang sobekan kiri peta petunjuk. Belajar bahwa menjadi yang tercepat tidak berarti jika kehilangan rekan seperjuangan.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <Shield className="h-3.5 w-3.5 text-red-400" />
            <span>Tanda Nama: "CANDRA"</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/40 bg-slate-900/80 p-4 shadow-lg ring-1 ring-amber-500/30">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-xs font-black text-amber-400">
              R
            </span>
            <div>
              <h4 className="text-sm font-bold text-white">Rana</h4>
              <p className="text-[11px] text-amber-300">Pramuka Putri • Berhijab & Bertopi Bonet</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-300">
            Sosok penengah yang bijak, tenang, dan berani. Menghentikan pertikaian antara Candra dan Rizki, serta membimbing mereka untuk menyatukan potongan peta hingga memancarkan kilau emas magis.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Kunci: Kolaborasi & Perdamaian</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-amber-500/40">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-xs font-black text-blue-400">
              R
            </span>
            <div>
              <h4 className="text-sm font-bold text-white">Rizki</h4>
              <p className="text-[11px] text-amber-400">Pramuka Penggalang • Rambut Keriting</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-300">
            Pemberani dan pantang menyerah. Memegang sobekan kanan peta dan sempat bersitegang dengan Candra. Menyadari bahwa kedua potongan peta saling melengkapi untuk membuka rute harta karun.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <Compass className="h-3.5 w-3.5 text-blue-400" />
            <span>Tanda Nama: "RIZKI"</span>
          </div>
        </div>
      </div>
    </div>
  );
};
