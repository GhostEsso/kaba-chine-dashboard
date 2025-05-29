import { CURRENCY, DEFAULT_LOCALE } from '../config';

/**
 * Formatte un nombre en devise avec le symbole et le séparateur de milliers
 * @param amount - Montant à formater
 * @param currency - Devise (par défaut: celle configurée dans config.ts)
 * @param locale - Paramètres régionaux pour le formatage (par défaut: fr-FR)
 * @returns Chaîne formatée (exemple: "1 000 XOF")
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = CURRENCY,
  locale: string = DEFAULT_LOCALE
): string {
  // Gérer les valeurs nulles, undefined ou vides
  if (amount === null || amount === undefined || amount === '') {
    return '0 ' + currency;
  }
  
  // Convertir en nombre si c'est une chaîne
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Si c'est NaN après conversion, retourner 0
  if (isNaN(numericAmount)) {
    return '0 ' + currency;
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

/**
 * Formatte une date au format local
 * @param date - Date à formater
 * @param locale - Paramètres régionaux (par défaut: fr-FR)
 * @returns Date formatée
 */
export function formatDate(
  date: Date | string,
  locale: string = DEFAULT_LOCALE
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
}

/**
 * Formatte un nombre avec séparateur de milliers
 * @param num - Nombre à formater
 * @param locale - Paramètres régionaux (par défaut: fr-FR)
 * @returns Nombre formaté avec séparateur de milliers
 */
export function formatNumber(
  num: number,
  locale: string = DEFAULT_LOCALE
): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Tronque un texte à une longueur spécifiée
 * @param text - Texte à tronquer
 * @param maxLength - Longueur maximale
 * @returns Texte tronqué avec ellipsis si nécessaire
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
} 