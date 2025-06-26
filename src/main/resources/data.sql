-- Limpa as tabelas antes de inserir para evitar duplicados a cada reinício (opcional, mas recomendado para desenvolvimento)
DELETE FROM equipamentos;
DELETE FROM locais;

-- Insere dados na tabela de equipamentos
-- A sintaxe é INSERT INTO nome_da_tabela (coluna1, coluna2) VALUES ('valor1', 'valor2');
INSERT INTO equipamentos (nome, tag) VALUES ('Prensa Hidráulica P-01', 'PR-001');
INSERT INTO equipamentos (nome, tag) VALUES ('Torno CNC Modelo TX-200', 'TR-001');
INSERT INTO equipamentos (nome, tag) VALUES ('Esteira Transportadora E-03', 'ET-003');

-- Insere dados na tabela de locais
INSERT INTO locais (nome, setor) VALUES ('Setor de Prensagem', 'Produção');
INSERT INTO locais (nome, setor) VALUES ('Ala de Usinagem', 'Produção');
INSERT INTO locais (nome, setor) VALUES ('Almoxarifado de Peças', 'Manutenção');