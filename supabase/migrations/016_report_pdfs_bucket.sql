-- bucket para PDFs de relatórios gerados
insert into storage.buckets (id, name, public)
values ('report-pdfs', 'report-pdfs', false)
on conflict (id) do nothing;

create policy "report-pdfs: autenticados leem" on storage.objects
  for select using (bucket_id = 'report-pdfs' and auth.role() = 'authenticated');

create policy "report-pdfs: autenticados inserem" on storage.objects
  for insert with check (bucket_id = 'report-pdfs' and auth.role() = 'authenticated');

create policy "report-pdfs: autenticados atualizam" on storage.objects
  for update using (bucket_id = 'report-pdfs' and auth.role() = 'authenticated');
