
import React, { useState, useRef } from 'react';
import { HunterProfile } from '../types';
import { X, Camera, Save, Upload, Link, RefreshCcw, AlertOctagon, Trash2 } from 'lucide-react';

interface ProfileEditorProps {
  profile: HunterProfile;
  onSave: (updates: Partial<HunterProfile>) => void;
  onReset: () => void;
  onClose: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onSave, onReset, onClose }) => {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave({ name, avatar });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      setIsCameraActive(false);
      alert("Erro do Sistema: Não foi possível acessar os sensores ópticos (Câmera).");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setAvatar(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="system-bg border-2 border-emerald-500/50 rounded-xl w-full max-w-lg overflow-hidden flex flex-col shadow-[0_0_50px_rgba(16, 185, 129, 0.2)]">
        <div className="p-4 border-b border-emerald-900/50 flex justify-between items-center bg-emerald-950/20">
          <h2 className="font-game text-xl neon-text-green-strong uppercase tracking-widest">Modificação do Perfil de Caçador</h2>
          <button onClick={() => { stopCamera(); onClose(); }} className="text-gray-500 hover:text-emerald-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[85vh]">
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full border-4 border-emerald-400 overflow-hidden shadow-[0_0_20px_rgba(16, 185, 129, 0.4)] relative">
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={avatar || 'https://picsum.photos/seed/hunter/200'}
                    alt="Caçador"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {!isCameraActive && (
                <div className="absolute -bottom-2 -right-2 flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-slate-900 border border-emerald-500 rounded-full text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                    title="Carregar Arquivo Local"
                  >
                    <Upload size={18} />
                  </button>
                  <button
                    onClick={startCamera}
                    className="p-2 bg-slate-900 border border-emerald-500 rounded-full text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                    title="Acessar Sensores Ópticos"
                  >
                    <Camera size={18} />
                  </button>
                </div>
              )}
            </div>

            {isCameraActive && (
              <div className="flex gap-4 w-full">
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded font-game text-sm hover:bg-emerald-500 shadow-[0_0_10px_rgba(16, 185, 129, 0.4)]"
                >
                  Capturar Imagem
                </button>
                <button
                  onClick={stopCamera}
                  className="flex-1 py-2 bg-red-900/50 text-red-400 border border-red-500/50 rounded font-game text-sm hover:bg-red-900/70"
                >
                  Cancelar
                </button>
              </div>
            )}

            <div className="w-full space-y-4">
              <div className="relative">
                <label className="block text-[10px] font-game text-emerald-500 mb-1 uppercase tracking-tighter">Fonte da Imagem de Identidade (URL)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-800" size={14} />
                    <input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="Insira link de dados externo..."
                      className="w-full bg-slate-900/80 border border-slate-700 rounded pl-9 pr-4 py-2 text-xs text-emerald-100 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => setAvatar(`https://picsum.photos/seed/${Math.random()}/300`)}
                    className="p-2 bg-slate-800 text-emerald-400 rounded hover:bg-slate-700 border border-slate-600"
                    title="Aleatorizar Aparência"
                  >
                    <RefreshCcw size={16} />
                  </button>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-emerald-900/30">
            <div>
              <label className="block text-xs font-game text-emerald-500 mb-2 uppercase tracking-widest">Codinome do Caçador</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-emerald-100 font-game text-xl focus:outline-none focus:border-emerald-500 shadow-inner"
                placeholder="Insira seu nome..."
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-emerald-900/50 flex flex-col gap-4 bg-emerald-950/10">
          {showResetConfirm ? (
            <div className="flex flex-col gap-3 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 p-3 bg-red-950/30 border border-red-500/50 rounded-lg">
                <AlertOctagon size={20} className="text-red-500 shrink-0 animate-pulse" />
                <p className="text-[10px] font-game text-red-400 uppercase leading-tight">
                  <span className="font-bold">AVISO CRÍTICO:</span> ESTA AÇÃO IRÁ APAGAR PERMANENTEMENTE SEU PROGRESSO, ITENS E ATRIBUTOS. ESTA OPERAÇÃO É IRREVERSÍVEL.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 rounded bg-slate-800 text-gray-400 hover:bg-slate-700 font-game text-xs tracking-widest uppercase transition-all"
                >
                  CANCELAR
                </button>
                <button
                  onClick={() => { onReset(); stopCamera(); }}
                  className="flex-1 py-3 rounded bg-red-600 text-white hover:bg-red-500 font-game text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> CONFIRMAR RESET
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              <div className="flex gap-4">
                <button
                  onClick={() => { stopCamera(); onClose(); }}
                  className="flex-1 py-3 rounded bg-slate-800 text-gray-400 hover:bg-slate-700 font-game text-xs tracking-widest uppercase transition-all"
                >
                  Abandonar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded bg-emerald-600 text-white hover:bg-emerald-500 font-game text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16, 185, 129, 0.3)] transition-all"
                >
                  <Save size={16} /> Atualizar Dados
                </button>
              </div>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-game text-red-900 hover:text-red-500 transition-colors uppercase tracking-[0.2em] border-t border-red-950/20 pt-4"
              >
                <AlertOctagon size={12} /> REINICIAR SISTEMA (ZERO DATA)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
