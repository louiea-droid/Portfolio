// Shared by the contact function and its check script. Files starting with "_" are not routes on Vercel.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validate({ name = '', email = '', message = '' } = {}) {
  name = String(name).trim()
  email = String(email).trim()
  message = String(message).trim()
  if (!name || name.length > 100) return { error: 'Add your name (up to 100 characters).' }
  if (!EMAIL.test(email) || email.length > 200) return { error: 'Add an email address I can reply to.' }
  if (message.length < 10) return { error: 'Write a little more about the project (at least 10 characters).' }
  if (message.length > 5000) return { error: 'Keep the message under 5,000 characters.' }
  return { value: { name, email, message } }
}
