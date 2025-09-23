import { z, ZodType } from 'zod';

const activity = z.object({
  title: z.string().describe("El titulo de la actividad que se va a desarrollar"),
  description: z.string().describe("Va a mostrar la descripción de la actividad en cuestion"),
  eventType: z.string().describe("Tipo de actividad a realizar"),
  link: z.string().optional().describe("(OPCIONAL) De ser necesario adicione un link relevante"),
  location: z.string().optional().describe("Lugar donde se va a llevar a cabo la actividad"),
  duration: z.string().describe("Cuanto tiempo se va a demorar la actividad"),
  speaker: z.string().describe("Quien va a ser el speaker o encargado de la actividad"),
  timestamp: z.string().describe("Horario en el cual se va a realizar la actividad")
}
);
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

const members = z.object({
  _id: z.coerce.number().describe("Número de identificación del miembro"),
  name: z.string().describe("Nombre completo del miembro"),
  title: z.string().describe("Carrera estudiada o en proceso"),
  role: z.string().describe("En que se desempeña actualmente en el grupo"),
  email: z.email().describe("Correo de la universidad"),
  bio: z.string().describe("Biografía breve del miembro"),
  skills: arrayFromString(z.string()).describe("Destrezas y áreas de habilidad del miembro. Ej: JavaScript,Python,Git y GitHub"),
  image: z.string().optional().describe("Imagen con el formato https://drive.google.com/uc?export=view&id=ID_DEL_ARCHIVO"),
  active: z.stringbool().describe("Si es un miembro activo o en su defecto fue miembro pasado del capítulo (true o false)"),
  linkedin: z.string().optional().describe("Link de LinkedIn del miembro"),
  github: z.string().optional().describe("Link de GitHub del miembro"),
  memberSince: z.string().describe("Periodo de ingreso al grupo. Ej: 2024-1"),
});

const results = z.object({
  local_id: z.string().describe("ID del primer participante"),
  visitant_id: z.string().describe("ID del segundo participante"),
  winner_id: z.string().describe("ID del ganador"),
  contest_id: z.string().describe("ID del concurso al que pertenece el resultado"),
})

const participation = z.object({
  contest_id: z.number(),
  student_id: z.number(),
  position: z.number().nullable(),
  checkin: z.boolean(),
})

const participationArray = z.object({
  error: z.any().nullable(),
  data: z.array(participation),
});

const student = z.object({
  id: z.number(),
  name: z.string(),
  surname: z.string(),
  matches_count: z.number().nullable(),
  victory_count: z.number().nullable(),
  level: z.string(),
  avatar: z.string().nullable(),
  supabase_user_id: z.string(),
})

const studentObject = z.object({
  error: z.any().nullable(),
  data: z.array(student),
})

export default {
  activity,
  members,
  results,
  participation,
  participationArray,
  student,
  studentObject,
}; 
