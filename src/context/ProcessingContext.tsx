import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface ProcessingContextType {
  isProcessing: boolean;
  processDocument: (formData: FormData, apiUrl: string, refreshLayout?: () => void) => Promise<void>;
}

const ProcessingContext = createContext<ProcessingContextType>({
  isProcessing: false,
  processDocument: async () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export function useProcessing() {
  return useContext(ProcessingContext);
}

export function ProcessingProvider({ children }: { children: React.ReactNode }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const processDocument = async (formData: FormData, apiUrl: string, refreshLayout?: () => void) => {
    setIsProcessing(true);
    try {
      const response = await axios.post(`${apiUrl}/documents/process`, formData);
      const newDocId = response.data?.data?.document_id || response.data?.data?.doc_hash;
      
      if (refreshLayout) {
        refreshLayout();
      }
      
      toast.success("Análise Inteligente concluída com sucesso!");
      
      if (newDocId) {
        navigate(`/?doc=${newDocId}`);
      } else {
        navigate(`/`);
      }
    } catch {
      toast.error("Erro ao processar documento. Verifique se a LLM está acessível e tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ProcessingContext.Provider value={{ isProcessing, processDocument }}>
      {children}
    </ProcessingContext.Provider>
  );
}
