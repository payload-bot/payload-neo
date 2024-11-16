-- Custom SQL migration file, put your code below! --

UPDATE Guild SET language = substr(lower(language), 1, 2) WHERE language NOT IN ('es-ES', 'en-US');
