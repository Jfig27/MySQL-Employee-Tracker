const mysql = require('mysql');
const inquirer = require('inquirer');
const util = require('util');

const cTable = require('console.table');

const connection = mysql.createConnection({
  host: 'localhost',

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: 'root',

  // Be sure to update with your own MySQL password!
  password: 'password',
  database: 'employeeDB',
});

const queryAsync = util.promisify(connection.query).bind(connection);

connection.connect((err) => {
  if (err) throw err;
  runSearch();
});

const runSearch = () => {
  inquirer
    .prompt({
      name: 'action',
      type: 'rawlist',
      message: 'What would you like to do?',
      choices: [
        'View All Employees',
        'View All Employees by Manager',
        'View All Employees by Department',
        'add Employee',
        'Remove Employee',
        'Update Employee Role',
        'Update Employee Manager',
        'View All Roles',
        'Exit'
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case 'View All Employees':
          employeeView();
          break;

        case 'View All Employees by Manager':
          managerSearch();
          break;

        case 'View All Employees by Department':
          departmentSearch();
          break;

        case 'add Employee':
          addEmployee();
          break;

        case 'Remove Employee':
          removeEmployee();
          break;
        
        case 'Update Employee Role':
          updateEmployeeRole();
          break;
          
        case 'Update Employee Manager':
          updateEmployeeManager();
          break;

        case 'View All Roles':
          viewRoles();
          break;

        case "EXIT":
          connection.end();
      }
    });
};

//view employees
const employeeView = () => {
  var query = `SELECT 
  employees.id, 
  employees.first_name, 
  employees.last_name, 
  role.title, 
  departments.name AS department, 
  role.salary, 
    CONCAT(manager.first_name, ' ', manager.last_name) AS Manager 
    FROM employees 
    LEFT JOIN role 
    ON employees.role_id = role.id 
    LEFT JOIN departments 
    ON role.department_id = departments.id 
    LEFT JOIN employees manager 
    ON manager.id = employees.manager_id;`;
    connection.query(query, function(err, query){
        console.table(query);
        runSearch();
    });
};


let getManager = async () => {
  try {
    const rows = await queryAsync('SELECT first_name, last_name, id FROM employees WHERE manager_id IS NULL');
    return rows.map((manager) => ({name: `${manager.first_name} ${manager.last_name}`, value: manager.id}));
  } catch (err) {
      console.log(`Err at getRoles,`, err);
  }
};

let managerSearch = async () => {
  const managers = await getManager();
  inquirer.prompt([
    {
      name: 'manager',
      type: 'list',
      message: 'Enter the manager you\'d like to search by:',
      choices: managers,
    }
  ])
  .then((answers) => {
    connection.query(` 
    SELECT 
      employee.id, 
      employee.first_name, 
      employee.last_name, 
      title, 
      department.name AS department,
      salary
    FROM employees employee
    LEFT JOIN role role 
      ON employee.role_id = role.id
    LEFT JOIN departments department
      ON role.id = department.id
    WHERE ?`,
    {
      manager_id: answers.manager,
    },
    (err, query) => {
      if (err) throw err;
      console.table(query);
      runSearch();
    });
  })

}


//view employee by Department
function departmentSearch() {
  var query =`SELECT departments.name AS department, employees.id, employees.first_name, employees.last_name, role.title FROM employees LEFT JOIN role on 
  employees.role_id = role.id LEFT JOIN departments departments on role.department_id = departments.id WHERE departments.id;`;
  connection.query(query, function(err, query){
    console.table(query);
    runSearch();
});
};

function addEmployee() {
  //arrays to display prompt choices from database items 
  var roleChoice = [];
  connection.query("SELECT * FROM role", function(err, resRole) {
    if (err) throw err;
    for (var i = 0; i < resRole.length; i++) {
      var roleList = resRole[i].title;
      roleChoice.push(roleList);
    };

    var deptChoice = [];
    connection.query("SELECT * FROM departments", function(err, resDept) {
      if (err) throw err;
      for (var i = 0; i < resDept.length; i++) {
        var deptList = resDept[i].name;
        deptChoice.push(deptList);
    }
    
    inquirer
      .prompt([
      {
        name: "firstName",
        type: "input",
        message: "Enter employee's first name:"
      },
      {
        name: "lastName",
        type: "input",
        message: "Enter employee's last name:"
      },
      {
        name: "role_id",
        type: "rawlist",
        message: "Select employee role:",
        choices: roleChoice
      }

    ])
      .then(function(answer) {
        //for loop to retun 
        var chosenRole;
          for (var i = 0; i < resRole.length; i++) {
            if (resRole[i].title === answer.role_id) {
              chosenRole = resRole[i];
            }
          };

          var chosenDept;
          for (var i = 0; i < resDept.length; i++) {
            if (resDept[i].id === chosenRole.department_id) {
              chosenDept = resDept[i];
            }
          };
        //connection to insert response into database  
        connection.query(
          "INSERT INTO employees SET ?",
          {
            first_name: answer.firstName,
            last_name: answer.lastName,
            role_id: chosenRole.id,
            department_id: chosenDept.id
          },
          function(err) {
            if (err) throw err;
            console.log("Employee " + answer.firstName + " " + answer.lastName + " successfully added!");
            runSearch();
          }
        );
      })
   });
  })
};

function removeEmployee() {
  var empSelect = [];
    connection.query("SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees", function(err, resEmp) {
      if (err) throw err;
      for (var i = 0; i < resEmp.length; i++) {
        var empList = resEmp[i].name;
        empSelect.push(empList);
    };

  inquirer
    .prompt([
      {
        name: "employee_id",
        type: "rawlist",
        message: "Select the employee you would like to remove:",
        choices: empSelect
      },
  ])
  .then(function(answer) {

    var chosenEmp;
        for (var i = 0; i < resEmp.length; i++) {
          if (resEmp[i].name === answer.employee_id) {
            chosenEmp = resEmp[i];
        }
      };

    connection.query(
      "DELETE FROM employees WHERE id=?",
      [chosenEmp.id],

      function(err) {
        if (err) throw err;
        console.log("Employee successfully removed!");
        runSearch();
      }
    );
   });
  })
};

function updateEmployeeRole() {
  var empSelect = [];
    connection.query("SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees", function(err, resEmp) {
      if (err) throw err;
      for (var i = 0; i < resEmp.length; i++) {
        var empList = resEmp[i].name;
        empSelect.push(empList);
    };
    
    var roleChoice = [];
  connection.query("SELECT * FROM role", function(err, resRole) {
    if (err) throw err;
    for (var i = 0; i < resRole.length; i++) {
      var roleList = resRole[i].title;
      roleChoice.push(roleList);
    };

    inquirer
    .prompt([
    {
      name: "employee_id",
      type: "rawlist",
      message: "Select the employee you would like to update:",
      choices: empSelect
    },
    {
      name: "role_id",
      type: "rawlist",
      message: "Select employee's new role:",
      choices: roleChoice
    }
  ])
  .then(function(answer) {

    var chosenEmp;
        for (var i = 0; i < resEmp.length; i++) {
          if (resEmp[i].name === answer.employee_id) {
            chosenEmp = resEmp[i];
        }
      };

    var chosenRole;
      for (var i = 0; i < resRole.length; i++) {
        if (resRole[i].title === answer.role_id) {
          chosenRole = resRole[i];
        }
      };
      connection.query(
        "UPDATE employees SET role_id = ? WHERE id = ?",
        [chosenRole.id, chosenEmp.id],
        function(err) {
          if (err) throw err;
          console.log("Employee new role successfully updated!");
          runSearch();
        }
      );
    })
   })
  })
};

function updateEmployeeManager() {
  var empSelect = [];
    connection.query("SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees", function(err, resEmp) {
      if (err) throw err;
      for (var i = 0; i < resEmp.length; i++) {
        var empList = resEmp[i].name;
        empSelect.push(empList);
    };

    inquirer
    .prompt([
    {
      name:"employees",
      type: "rawlist",
      message: "Select employee you would like to update manager:",
      choices: empSelect
    },
    {
      name: "Managerid",
      type: "rawlist",
      message: "Select Manager among employees:",
      choices: empSelect
    }
  ])
  .then(function(answer) {

    var chosenEmp;
        for (var i = 0; i < resEmp.length; i++) {
          if (resEmp[i].name === answer.employees) {
            chosenEmp = resEmp[i];
        }
      };
      var chosenManager;
        for (var i = 0; i < resEmp.length; i++) {
          if (resEmp[i].name === answer.Managerid) {
            chosenManager = resEmp[i];
        }
      };
      connection.query(
        "UPDATE employees SET manager_id = ? WHERE id = ?",

        [chosenManager.id, chosenEmp.id],
        function(err) {
          if (err) throw err;
          console.log("Employee Manager successfully updated!");
          runSearch();
        }
      );
    })
   })
};

let viewRoles = () => {
  connection.query('SELECT * FROM employeedb.role AS Roles;',
  (err, res) => {
    if (err) throw err;
    console.table(res);
    runSearch();
  });
} 