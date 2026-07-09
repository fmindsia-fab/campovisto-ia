-- coordenadas da propriedade, para localização precisa em mapa (voo de drone)
alter table public.properties
  add column if not exists latitude  numeric,
  add column if not exists longitude numeric;
