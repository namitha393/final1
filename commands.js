#!/usr/bin/env node  
const program = require('commander');
const { prompt } = require('inquirer');
const {Var} = require("./models/Var.js");

// Authentication questions

const authQs=[
    {
        type: "input",
        name: "username",
        message: "Username"
    },
    {
        type: "password",
        name: "password",
        message: "Password"
    }
]

const {
    showCourses,
    LogIn,
    Logout,
    getCourses,
    getAssignments,
    getInfo,
    getGrades,
    Download,
    Upload,
  
} = require('./Functions.js');


program
    .version("1.0.0")
    .alias("v")
    .description("Float Moodle CLI")



program
    .command("list courses")
    .alias('sc')
    .description("Lists out all the courses")
    .action(()=>{
        showCourses();
    });

program
    .command("Login")
    .alias("li")
    .description("To login")
    .action(()=>{
        prompt(authQs).then(answers=>LogIn(answers));
    })

program
    .command("Logout")
    .alias("lo")
    .description("To logout")
    .action(()=>{
        Logout();
    })

program
    .command("getCourses")
    .alias("gc")
    .description("Prints the courses in which you are enrolled")
    .action(()=>{
        getCourses();
    })

program
    .command("getAssignments <courseName>")
    .alias("ga")
    .description("Prints the assignments present in a course")
    .action(courseName=>{
        getAssignments(courseName);
    })

program
    .command("getAssignmentInfo <courseName> <assName>")
    .alias("gi")
    .description("Prints the assignment details")
    .action((courseName,assName)=>{
        getInfo(courseName,assName);
    })
program
    .command("getGrades <courseName> <assName>")
    .alias("gg")
    .description("Prints the grade in an assignment")
    .action((courseName,assName)=>{
        getGrades(courseName,assName);
    })
program
    .command("downloadAssignment <courseName> <assName>")
    .alias("da")
    .description("Downloads the problem statement of an assignment")
    .action((courseName,assName)=>{
        Download(courseName,assName);
    })

program
    .command("uploadSolution <courseName> <assName> <path> <fileName>")
    .alias("u")
    .description("Uploads your solution for an assignment")
    .action((courseName,assName,path,fileName)=>{
        Upload(courseName,assName,path,fileName);
    })


program.parse(process.argv)