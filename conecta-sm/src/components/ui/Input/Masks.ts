/**
 * Arquivo utilitário para máscaras e formatações de inputs
 * Regra: Sempre remover caracteres indesejados e reformatar
 */

export const unmask = (value: string) => {
  if (!value) return '';
  return value.toString().replace(/\D/g, '');
};

export const maskCPF = (value: string) => {
  return unmask(value)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1'); // Limita a 11 digitos numericos no total
};

export const maskCNPJ = (value: string) => {
  return unmask(value)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1'); // Limita a 14 digitos numericos
};

export const maskPhone = (value: string) => {
  let v = unmask(value);
  if (v.length > 11) v = v.substring(0, 11);

  if (v.length <= 10) {
    // Fixo: (XX) XXXX-XXXX
    return v
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // Celular: (XX) XXXXX-XXXX
    return v
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
};

export const maskCEP = (value: string) => {
  return unmask(value)
    .replace(/(\d{5})(\d)/, '$1-$2')
    .substring(0, 9);
};

export const maskDate = (value: string) => {
  return unmask(value)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .substring(0, 10);
};

export const maskCurrency = (value: string | number) => {
  if (value === undefined || value === null || value === '') return '';

  let v = value.toString();

  // Remove tudo o que não for número
  v = v.replace(/\D/g, '');

  if (!v) return '';

  // Converte para decimal (centavos)
  v = (parseInt(v, 10) / 100).toFixed(2);
  
  // Adiciona a máscara BRL
  return `R$ ${v.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}`;
};

export const unmaskCurrency = (value: string) => {
  if (!value) return 0;
  // Transforma "R$ 1.500,00" -> 1500.00
  const cleanStr = value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
  return parseFloat(cleanStr) || 0;
};
