import { z, ZodType } from 'zod';

const arrayFromString = <T extends ZodType>(schema: T) => {
  return z.preprocess((obj: unknown) => {
    if (!obj) {
      return [];
    }
    if (Array.isArray(obj)) {
      return obj;
    }
    if (typeof obj === 'string') {
      return obj.split(',').map(_ => _.trim());
    }

    return [];
  }, z.array(schema));
};

const activity = z.object({
  title: z.string().describe("El título de la actividad que se va a desarrollar"),
  description: z.string().describe("Descripción de la actividad en cuestión"),
  eventType: z.string().describe("Tipo de actividad a realizar"),
  link: z.string().optional().describe("(OPCIONAL) Si es necesario, adicione un enlace relevante"),
  location: z.string().optional().describe("Lugar donde se llevará a cabo la actividad"),
  duration: z.string().describe("Duración estimada de la actividad"),
  speaker: z.string().describe("Persona encargada o speaker de la actividad"),
  timestamp: z.string().describe("Horario en el cual se realizará la actividad")
});

const members = z.object({
  _id: z.coerce.number().describe("Número de identificación del miembro"),
  name: z.string().describe("Nombre completo del miembro"),
  title: z.string().describe("Carrera estudiada o en proceso"),
  role: z.string().describe("Rol o función actual en el grupo"),
  email: z.email().describe("Correo institucional de la universidad"),
  bio: z.string().describe("Biografía breve del miembro"),
  skills: arrayFromString(z.string()).describe("Destrezas y áreas de habilidad del miembro. Ej: JavaScript,Python,Git y GitHub"),
  image: z.string().optional().describe("Imagen con el formato https://drive.google.com/uc?export=view&id=ID_DEL_ARCHIVO"),
  active: z.stringbool().describe("Indica si es un miembro activo o fue miembro pasado del capítulo (true o false)"),
  linkedin: z.string().optional().describe("Enlace de LinkedIn del miembro"),
  github: z.string().optional().describe("Enlace de GitHub del miembro"),
  memberSince: z.string().describe("Periodo de ingreso al grupo. Ej: 2024-1"),
});

const levelOptions = ["Initial", "Advanced"];

const contests = z.object({
  name: z.string().describe("Nombre del concurso"),
  date: z.iso.date().describe("Fecha del concurso en formato YYYY-MM-DD"),
  start_hour: z.iso
    .datetime()
    .describe(
      "Hora de inicio del concurso en formato yyyy-mm-ddThh:mmZ (hora militar)"),
  final_hour: z.iso
    .datetime()
    .describe(
      "Hora de finalización del concurso en formato yyyy-mm-ddThh:mmZ (hora militar)"),
  level: z
    .enum(levelOptions)
    .describe(`Nivel del concurso (${levelOptions.join(",")})`),
  classroom: z
    .string()
    .optional()
    .describe("Aula universitaria donde se realizará el concurso"),
});

const pictures = z.object({
  contest_id: z.coerce.number().describe("ID del concurso"),
  link: z.string().describe("URL de la imagen"),
});

// TODO: Esta entidad temporalmente solo sería para editar algún atributo, las otras acciones CRUD no tienen
// sentido en este contexto.
const students = z.object({
  name: z.string().describe("Nombre del estudiante"),
  surname: z.string().describe("Apellido del estudiante"),
  level: z.enum(levelOptions).describe(`Nivel del estudiante (${levelOptions.join(",")})`),
  avatar: z.string().optional().describe("URL del avatar del estudiante"),
});

export default {
  activity,
  members,
  students,
  contests,
  pictures
}; 
