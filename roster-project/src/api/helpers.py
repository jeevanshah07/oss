from bson import ObjectId


def calculateGPA(courses: dict):
    credit = 0
    points = 0

    print(courses)

    for i in range(len(courses)):
        credit += int(courses[i]["credits"])
        points += int(courses[i]["credits"]) * switchGrade(courses[i]["grade"])

    return points / credit


def switchGrade(grade: str) -> float:
    match grade:
        case "A":
            return 4
        case "B+":
            return 3.5
        case "B":
            return 3
        case "C+":
            return 2.5
        case "C":
            return 2
        case "D":
            return 1
        case "F":
            return 0
        case _:
            return 0


def updateGPA(collection, _id) -> bool:
    res1 = collection.find({"_id": _id})

    res = collection.update_one(
        {"_id": _id},
        {"$set": {"gpa": calculateGPA(list(res1)[0]["classes"])}},
    )

    return res.acknowledged
