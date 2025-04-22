export const useTextLimiter = (text: string, wordLimit: number) => {
  const arrDesc = text.split(' ')

  if (arrDesc.length > wordLimit)
    return arrDesc.slice(0, wordLimit).join(' ').concat(' ... ')
  else
    return text
}
