export const RGB_TYPES = [
  { value: 'overview',   label: 'Visão geral',   description: 'Vista aérea geral da propriedade' },
  { value: 'pasture',    label: 'Pastagem',       description: 'Área de pastagem e forragem' },
  { value: 'livestock',  label: 'Rebanho',        description: 'Animais visíveis na imagem' },
  { value: 'bare_soil',  label: 'Solo exposto',   description: 'Área sem cobertura vegetal' },
  { value: 'water',      label: 'Água',           description: 'Açude, rio, bebedouro natural' },
  { value: 'fence',      label: 'Cerca',          description: 'Cercamento e divisões de pasto' },
  { value: 'waterer',    label: 'Bebedouro',      description: 'Bebedouro artificial' },
  { value: 'crop',       label: 'Lavoura',        description: 'Área de cultivo agrícola' },
  { value: 'structure',  label: 'Estrutura',      description: 'Galpão, curral, instalação' },
  { value: 'wetland',    label: 'Área úmida',     description: 'Brejo, várzea, área alagada' },
  { value: 'other',      label: 'Outro',          description: 'Outro tipo de imagem' },
]

export const SPECTRAL_TYPES = [
  { value: 'ndvi', label: 'NDVI', description: 'Saúde geral da vegetação — detecta degradação, biomassa e vigor' },
  { value: 'ndre', label: 'NDRE', description: 'Vigor em vegetação densa — detecta deficiências nutricionais' },
  { value: 'evi',  label: 'EVI',  description: 'Vegetação exuberante — corrige saturação do NDVI' },
  { value: 'savi', label: 'SAVI', description: 'Baixa cobertura vegetal — ideal para pastagens degradadas' },
  { value: 'ndwi', label: 'NDWI', description: 'Estresse hídrico — detecta déficit de água nas plantas' },
]

export const ALL_IMAGE_TYPE_LABELS: Record<string, string> = {
  ...Object.fromEntries(RGB_TYPES.map((t) => [t.value, t.label])),
  ...Object.fromEntries(SPECTRAL_TYPES.map((t) => [t.value, t.label])),
}
