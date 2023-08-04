export function emailValidator(email) {
  const re = /@upsrj.edu.mx/
  if (!email) return "Email can't be empty."
  if (!re.test(email)) return 'Ooops! We need a valid email address by the University.'
  return ''
}
