import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useOutletContext } from 'react-router-dom';
import UploadSection from '../components/dashboard/UploadSection';

interface LayoutContext {
  refreshLayout: () => void;
  apiUrl: string;
}

export default function NewDocument() {
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState("");
  const { apiUrl, refreshLayout } = useOutletContext<LayoutContext>();
  const navigate = useNavigate();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    await processData(formData);
  };

  const handleTextSubmit = async () => {
    const formData = new FormData();
    formData.append("raw_text", textInput);
    await processData(formData);
  };

  const processData = async (formData: FormData) => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/documents/process`, formData);
      refreshLayout(); 
      // Redirect to home explicitly loading the newly returned ID if possible
      const newDocId = response.data?.data?.document_id || response.data?.data?.doc_hash;
      if (newDocId) {
        navigate(`/?doc=${newDocId}`);
      } else {
        navigate(`/`);
      }
    } catch {
      alert("Erro ao processar documento. Verifique se a API está rodando e se há um modelo LLM acessível.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Nova Análise Inteligente</h2>
        <p className="text-slate-500 mt-1">Faça o upload de um PDF ou cole o texto de uma fatura para estruturar os dados com a Inteligência Artificial.</p>
      </div>
      <UploadSection
        handleFileUpload={handleFileUpload}
        textInput={textInput}
        setTextInput={setTextInput}
        handleTextSubmit={handleTextSubmit}
        loading={loading}
      />
    </div>
  );
}
