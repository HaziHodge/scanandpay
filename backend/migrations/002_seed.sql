-- Insert seed venue 'Bar El Liguria'
-- Password is 'demo1234'
INSERT INTO venues (id, name, slug, owner_email, password_hash) 
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'Bar El Liguria', 
  'bar-el-liguria', 
  'demo@scanandpay.cl', 
  '$2b$12$N9yUoJvL1G4v/Jj/O3P0vOWQ1FjFhPZ8o67F6JgD1n1zQWpYX7f2K'
);

-- Insert 5 tables
INSERT INTO tables (id, venue_id, table_number) VALUES
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 1),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 2),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 3),
  ('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111111', 4),
  ('22222222-2222-2222-2222-222222222225', '11111111-1111-1111-1111-111111111111', 5);

-- Insert 3 categories
INSERT INTO menu_categories (id, venue_id, name, display_order) VALUES
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'Bebidas', 1),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'Comida', 2),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Postres', 3);

-- Insert 10 menu items
INSERT INTO menu_items (id, venue_id, category_id, name, description, price, image_url, display_order) VALUES
  ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'Pisco Sour Catedral', 'El clásico preparado con limón sutil y pisco doble destilado, receta de la casa.', 6500, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600', 1),
  ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'Schop Austral Calafate', 'Cerveza patagónica de barril 500cc.', 4500, 'https://images.unsplash.com/photo-1505075936514-6292b67f33eb?auto=format&fit=crop&q=80&w=600', 2),
  ('44444444-4444-4444-4444-444444444443', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'Jugo Natural', 'Frambuesa, Mango o Piña.', 3000, 'https://images.unsplash.com/photo-1622597467836-f38240662c8b?auto=format&fit=crop&q=80&w=600', 3),

  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', 'Chorrillana Tradicional', 'Papas fritas caseras, carne de vacuno, cebolla y huevos fritos para compartir.', 15000, 'https://images.unsplash.com/photo-1598023696416-018d0061e011?auto=format&fit=crop&q=80&w=600', 1),
  ('44444444-4444-4444-4444-444444444445', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', 'Sándwich de Membrillo', 'Pan frica, plateada deshilachada, queso fundido y palta.', 8900, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=600', 2),
  ('44444444-4444-4444-4444-444444444446', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', 'Empanada de Pino', 'Tradicional empanada chilena horneada al momento.', 3500, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600', 3),
  ('44444444-4444-4444-4444-444444444447', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', 'Tabla Quesos y Fiambres', 'Selección de quesos del sur, jamón serrano y aceitunas. Ideal para 2 personas.', 18000, 'https://images.unsplash.com/photo-1615486511484-912df08b47ab?auto=format&fit=crop&q=80&w=600', 4),

  ('44444444-4444-4444-4444-444444444448', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Leche Asada', 'Postre tradicional casero con caramelo.', 3500, 'https://images.unsplash.com/photo-1632729904797-152b1b3fb49d?auto=format&fit=crop&q=80&w=600', 1),
  ('44444444-4444-4444-4444-444444444449', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Torta Tres Leches', 'Bizcocho bañado en tres tipos de leche con merengue suizo.', 4200, 'https://images.unsplash.com/photo-1549495123-5c742c366e6b?auto=format&fit=crop&q=80&w=600', 2),
  ('44444444-4444-4444-4444-444444444450', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Helado Artesanal', 'Dos sabores a elección (manjar, vainilla, chocolate).', 3000, 'https://images.unsplash.com/photo-1563805042-7684c8a9e9ce?auto=format&fit=crop&q=80&w=600', 3);
