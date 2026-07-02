-- Optional signup segmentation: which stage of the journey the subscriber
-- is in. Used to personalize launch emails. The API tolerates this column
-- being absent, so deploying before running this migration is safe.
alter table waitlist
  add column if not exists momento text check (momento in (
    'turista', 'estudante', 'trabalho', 'green_card', 'no_brasil', 'outro'
  ));
