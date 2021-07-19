USE employeeDb;
-- Departments Data
INSERT INTO departments (name) VALUES 
("Production"),
("Research and Development"),
("Purchasing"),
("Marketing"),
("Human Resource Management");

-- Roles Data
INSERT INTO role (title, salary, department_id) VALUES 
("Product Manager", 100000, 1),
("Production Associate", 62000, 1),
("Chief Engineer", 90000, 2),
("Jr Engineer", 50000, 2),
("Supply Chain Manager", 80000, 3),
("Procurement Officer", 50000, 3),
("Marketing Specialist", 110000, 4),
("Sales Associate", 100000, 4),
("HR Manager", 80000, 5),
("HR Associate", 60000, 5);

-- Employees Data
INSERT INTO employees (first_name, last_name, role_id, manager_id, department_id) VALUES
("Ashton", "King", 7, NULL, 4),
("Sammy", "Pearce", 5, NULL, 3),
("Elliot", "Walsh", 8, 1, 4),
("Sammy", "Jones", 1, NULL, 1),
("Lane", "Jackson", 3, NULL, 2),
("Ray", "Summers", 6, 2, 3),
("Reggie", "Farmer", 2, 4, 1),
("Jaime", "Hernandez", 4, 5, 2),
("Glen", "Stout", 9, NULL, 5),
("Caden", "Suarez", 10, 9, 5);
