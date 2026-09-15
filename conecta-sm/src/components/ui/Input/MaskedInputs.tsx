import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import { maskCPF, maskCNPJ, maskPhone, maskCEP, maskCurrency, maskDate, unmask, unmaskCurrency } from './Masks';

// Extensão das propriedades do Input original
interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  value?: string | number;
  /**
   * Callback customizado que retorna o valor limpo (para salvar no banco) e o valor com máscara (para mostrar na UI)
   */
  onValueChange?: (unmaskedValue: string, maskedValue: string) => void;
}

// ---------------------------
// CPF Input
// ---------------------------
export const CPFInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ value, onValueChange, ...props }, ref) => {
    const [maskedVal, setMaskedVal] = useState('');

    useEffect(() => {
      setMaskedVal(maskCPF(value?.toString() || ''));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const masked = maskCPF(e.target.value);
      const unmasked = unmask(masked);
      setMaskedVal(masked);
      if (onValueChange) onValueChange(unmasked, masked);
    };

    const { name, ...restProps } = props;
    return (
      <>
        {name && <input type="hidden" name={name} value={unmask(maskedVal)} />}
        <Input ref={ref} value={maskedVal} onChange={handleChange} maxLength={14} placeholder="000.000.000-00" {...restProps} />
      </>
    );
  }
);
CPFInput.displayName = 'CPFInput';

// ---------------------------
// CNPJ Input
// ---------------------------
export const CNPJInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ value, onValueChange, ...props }, ref) => {
    const [maskedVal, setMaskedVal] = useState('');

    useEffect(() => {
      setMaskedVal(maskCNPJ(value?.toString() || ''));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const masked = maskCNPJ(e.target.value);
      const unmasked = unmask(masked);
      setMaskedVal(masked);
      if (onValueChange) onValueChange(unmasked, masked);
    };

    const { name, ...restProps } = props;
    return (
      <>
        {name && <input type="hidden" name={name} value={unmask(maskedVal)} />}
        <Input ref={ref} value={maskedVal} onChange={handleChange} maxLength={18} placeholder="00.000.000/0000-00" {...restProps} />
      </>
    );
  }
);
CNPJInput.displayName = 'CNPJInput';

// ---------------------------
// Phone Input (Celular e Fixo)
// ---------------------------
export const PhoneInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ value, onValueChange, ...props }, ref) => {
    const [maskedVal, setMaskedVal] = useState('');

    useEffect(() => {
      setMaskedVal(maskPhone(value?.toString() || ''));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const masked = maskPhone(e.target.value);
      const unmasked = unmask(masked);
      setMaskedVal(masked);
      if (onValueChange) onValueChange(unmasked, masked);
    };

    const { name, ...restProps } = props;
    return (
      <>
        {name && <input type="hidden" name={name} value={unmask(maskedVal)} />}
        <Input ref={ref} value={maskedVal} onChange={handleChange} maxLength={15} placeholder="(00) 00000-0000" {...restProps} />
      </>
    );
  }
);
PhoneInput.displayName = 'PhoneInput';

// ---------------------------
// CEP Input (Com busca inteligente)
// ---------------------------
interface CEPInputProps extends MaskedInputProps {
  onAddressFetch?: (data: { logradouro: string; bairro: string; localidade: string; uf: string }) => void;
}

export const CEPInput = React.forwardRef<HTMLInputElement, CEPInputProps>(
  ({ value, onValueChange, onAddressFetch, ...props }, ref) => {
    const [maskedVal, setMaskedVal] = useState('');

    useEffect(() => {
      setMaskedVal(maskCEP(value?.toString() || ''));
    }, [value]);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const masked = maskCEP(e.target.value);
      const unmasked = unmask(masked);
      setMaskedVal(masked);
      
      if (onValueChange) onValueChange(unmasked, masked);

      if (masked.length === 9 && onAddressFetch) {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${unmasked}/json/`);
          const cepData = await res.json();
          if (!cepData.erro) {
            onAddressFetch({
              logradouro: cepData.logradouro || '',
              bairro: cepData.bairro || '',
              localidade: cepData.localidade || '',
              uf: cepData.uf || ''
            });
          }
        } catch (err) {
          console.error('Erro ao buscar CEP:', err);
        }
      }
    };

    const { name, ...restProps } = props;
    return (
      <>
        {name && <input type="hidden" name={name} value={unmask(maskedVal)} />}
        <Input ref={ref} value={maskedVal} onChange={handleChange} maxLength={9} placeholder="00000-000" {...restProps} />
      </>
    );
  }
);
CEPInput.displayName = 'CEPInput';

// ---------------------------
// Date Input (DD/MM/AAAA)
// ---------------------------
export const DateInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ value, onValueChange, ...props }, ref) => {
    const [maskedVal, setMaskedVal] = useState('');

    useEffect(() => {
      setMaskedVal(maskDate(value?.toString() || ''));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const masked = maskDate(e.target.value);
      const unmasked = unmask(masked); // retorna DDMMAAAA
      
      setMaskedVal(masked);
      
      // Para salvar no banco pode ser melhor retornar DDMMAAAA e converter lá, ou retornar algo que possa ser Date.
      if (onValueChange) onValueChange(unmasked, masked);
    };

    const { name, ...restProps } = props;
    return (
      <>
        {name && <input type="hidden" name={name} value={unmask(maskedVal)} />}
        <Input ref={ref} value={maskedVal} onChange={handleChange} maxLength={10} placeholder="DD/MM/AAAA" {...restProps} />
      </>
    );
  }
);
DateInput.displayName = 'DateInput';

// ---------------------------
// Currency Input (R$ 0,00)
// ---------------------------
export const CurrencyInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ value, onValueChange, ...props }, ref) => {
    const [maskedVal, setMaskedVal] = useState('');

    useEffect(() => {
      if (value === undefined || value === null || value === '') {
        setMaskedVal('');
        return;
      }

      // Se o valor já corresponde ao valor atual mascarado, não faça nada (evita o loop do usuário digitando)
      const currentFloat = unmaskCurrency(maskedVal);
      const incomingFloat = typeof value === 'string' ? parseFloat(value) : value;
      
      if (!isNaN(incomingFloat) && currentFloat !== incomingFloat) {
         // Formata do DB ou quando o pai seta um valor programaticamente
         const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(incomingFloat);
         setMaskedVal(formatted);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputVal = e.target.value;
      const masked = maskCurrency(inputVal);
      setMaskedVal(masked);
      
      // Para o banco, precisamos retornar o float real
      const floatVal = unmaskCurrency(masked).toString();
      if (onValueChange) onValueChange(floatVal, masked);
    };

    const { name, ...restProps } = props;
    return (
      <>
        {name && <input type="hidden" name={name} value={unmaskCurrency(maskedVal).toString()} />}
        <Input ref={ref} value={maskedVal} onChange={handleChange} placeholder="R$ 0,00" {...restProps} />
      </>
    );
  }
);
CurrencyInput.displayName = 'CurrencyInput';
