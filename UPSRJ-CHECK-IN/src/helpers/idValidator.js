export function idValidator(id) {
  if (!id) return "ID can't be empty.";
  
  // Utilizamos una expresión regular para validar que el id solo contenga números y tenga máximo 10 dígitos.
  const regex = /^\d{1,10}$/;
  
  if (!regex.test(id)) {
    return "ID must contain only numbers and have a maximum of 10 digits.";
  }

  return '';
}
