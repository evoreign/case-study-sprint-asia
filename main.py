def gradingStudents(grades):
    rounded_grades = []
    for grade in grades:
        if grade < 38:
            rounded_grades.append(grade)
        else:
            next_multiple_of_5 = ((grade // 5) + 1) * 5
            if next_multiple_of_5 - grade < 3:
                rounded_grades.append(next_multiple_of_5)
            else:
                rounded_grades.append(grade)
    return rounded_grades

amount = int(input())
grades = []
for i in range(amount):
    grade = int(input())
    grades.append(grade)

rounded_grades = gradingStudents(grades)
for grade in rounded_grades:
    print("--------------------")
    print(grade)
