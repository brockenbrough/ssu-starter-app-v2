-- Run this in your Supabase SQL editor to create the profile table.

create table myapp_profile (
  id        uuid primary key references auth.users(id) on delete cascade,
  username  text not null,
  biography text not null default ''
);
