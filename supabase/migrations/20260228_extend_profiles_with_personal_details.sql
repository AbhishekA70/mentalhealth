-- Extends profiles with optional personal/family details + avatar.

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists phone text,
  add column if not exists date_of_birth date,
  add column if not exists gender text,
  add column if not exists address text,
  add column if not exists family_details text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    phone,
    date_of_birth,
    gender,
    address,
    family_details
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'date_of_birth', '')::date,
    nullif(new.raw_user_meta_data ->> 'gender', ''),
    nullif(new.raw_user_meta_data ->> 'address', ''),
    nullif(new.raw_user_meta_data ->> 'family_details', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        avatar_url = excluded.avatar_url,
        phone = excluded.phone,
        date_of_birth = excluded.date_of_birth,
        gender = excluded.gender,
        address = excluded.address,
        family_details = excluded.family_details,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

-- Backfill users created before this migration from auth metadata.
insert into public.profiles (
  id,
  email,
  full_name,
  avatar_url,
  phone,
  date_of_birth,
  gender,
  address,
  family_details
)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', ''),
  nullif(u.raw_user_meta_data ->> 'avatar_url', ''),
  nullif(u.raw_user_meta_data ->> 'phone', ''),
  nullif(u.raw_user_meta_data ->> 'date_of_birth', '')::date,
  nullif(u.raw_user_meta_data ->> 'gender', ''),
  nullif(u.raw_user_meta_data ->> 'address', ''),
  nullif(u.raw_user_meta_data ->> 'family_details', '')
from auth.users u
on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      avatar_url = excluded.avatar_url,
      phone = excluded.phone,
      date_of_birth = excluded.date_of_birth,
      gender = excluded.gender,
      address = excluded.address,
      family_details = excluded.family_details,
      updated_at = timezone('utc', now());
