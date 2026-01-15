from flask import Flask, request, jsonify
from bson import ObjectId
from pymongo import MongoClient

app = Flask(__name__)
client = MongoClient()
db = client["rosterProject"]


@app.route("/api/classes", methods=["POST"])
def create_class():
    collection = db["classes"]
    data = request.get_json()

    res = collection.count_documents(
        {"name": data.get("name"), "professor": data.get("professor")}
    )

    if res > 0:
        return jsonify({"error": "class already exists"}), 400

    doc = {
        "name": data.get("name"),
        "professor": data.get("professor"),
        "students": [],
        "credits": data.get("credits"),
    }

    res = str(collection.insert_one(doc).inserted_id)

    return jsonify({"id": res})


@app.route("/api/classes", methods=["GET"])
def get_all_classes():
    collection = db["classes"]

    classes = []
    for doc in collection.find():
        classes.append(doc["name"])

    return jsonify(classes)


@app.route("/api/classes/<class_name>", methods=["GET"])
def get_class(class_name: str):
    collection = db["classes"]
    res = collection.find_one({"name": class_name})

    if res:
        res["_id"] = str(res["_id"])

        if len(res["students"]) > 0:
            for i in range(len(res["students"])):
                res["students"][i] = str(res["students"][i])
        return jsonify(res)
    else:
        return jsonify({"error": "class not found"}), 404


@app.route("/api/classes/<class_name>", methods=["PATCH"])
def edit_class(class_name: str):
    collection = db["classes"]
    data = request.get_json()
    res = collection.update_one(
        {"_id": ObjectId(data["_id"])},
        {
            "$set": {
                "name": data["name"],
                "professor": data["professor"],
                "credits": data["credits"],
            }
        },
    )

    collection = db["students"]
    res1 = collection.update_many(
        {"classes": class_name}, {"$set": {"classes.$": data["name"]}}
    )

    if res.acknowledged and res1.acknowledged:
        return jsonify({"success": "class updated"})
    else:
        return jsonify({"error": "error updating class"}), 400


@app.route("/api/classes/<class_name>", methods=["DELETE"])
def delete_class(class_name: str):
    collection = db["classes"]
    res = collection.delete_one({"name": class_name})

    collection = db["students"]
    collection.update_many(
        {"classes": {"name": class_name}}, {"$pull": {"classes": {"name": class_name}}}
    )

    if res.deleted_count > 0:
        return jsonify({"success": "class deleted successfully"})
    else:
        return jsonify({"error": "error deleting class!"}), 404


@app.route("/api/classes/<class_name>/students", methods=["DELETE"])
def remove_student_from_class(class_name: str):
    data = request.get_json()

    collection = db["students"]
    res = collection.update_one(
        {"_id": ObjectId(data["_id"])}, {"$pull": {"classes": {"name": class_name}}}
    )

    collection = db["classes"]
    res1 = collection.update_one(
        {"name": class_name}, {"$pull": {"students": ObjectId(data["_id"])}}
    )

    if res.acknowledged and res1.acknowledged:
        return jsonify({"success": "student removed from class"})
    else:
        return jsonify({"error": "error updating document"}), 404


@app.route("/api/classes/<class_name>/students", methods=["GET"])
def get_students(class_name: str):
    collection = db["students"]

    res = list(collection.find({"classes.name": class_name}))
    if res:
        for doc in res:
            doc["_id"] = str(doc["_id"])
        return jsonify(res)
    else:
        return jsonify([{}])


@app.route("/api/classes/<class_name>/students", methods=["PATCH"])
def update_grade(class_name: str):
    collection = db["students"]
    data = request.get_json()

    res = collection.update_one(
        {"_id": ObjectId(data["_id"]), "classes.name": class_name},
        {"$set": {"classes.$.grade": data["grade"]}},
    )

    if res.acknowledged:
        return jsonify({"succes": "grade updated"})
    else:
        return jsonify({"error": "error updating grade"}), 500


@app.route("/api/classes/<class_name>/students", methods=["PUT"])
def add_student_to_class(class_name: str):
    data = request.get_json()
    collection = db["students"]

    student = collection.find_one({"_id": ObjectId(data["_id"])})

    if student and class_name in student["classes"]:
        return jsonify({"error": "Student already in class!"}), 400

    res = collection.update_one(
        {"_id": ObjectId(data["_id"])},
        {
            "$push": {
                "classes": {
                    "name": class_name,
                    "credits": str(data["credits"]),
                    "grade": "A",
                }
            }
        },
    )

    collection = db["classes"]
    res1 = collection.update_one(
        {"name": class_name}, {"$push": {"students": ObjectId(data["_id"])}}
    )

    if (res.matched_count > 0 and res.modified_count > 0) and (
        res1.matched_count > 0 and res1.modified_count > 0
    ):
        return jsonify({"success": "student added to class"})
    else:
        return jsonify({"error": "error updating document"}), 404


@app.route("/api/students", methods=["POST"])
def create_students():
    data = request.get_json()
    collection = db["students"]

    res = collection.insert_one(
        {
            "classes": [],
            "firstName": data["first"],
            "lastName": data["last"],
            "graduatingYear": data["grad"],
            "major": data["major"],
            "gpa": 0,
        }
    )

    if res.acknowledged:
        print(res.inserted_id)
        return jsonify({"success": "student created correctly"})
    else:
        print("error")
        return jsonify({"error": "error creating student"}), 400


@app.route("/api/students", methods=["DELETE"])
def delete_student():
    data = request.get_json()
    collection = db["students"]
    res = collection.delete_one({"_id": ObjectId(data["_id"])})

    collection = db["classes"]
    collection.update_many(
        {"students": ObjectId(data["_id"])},
        {"$pull": {"students": ObjectId(data["_id"])}},
    )

    if res.deleted_count > 0:
        return jsonify({"success": "student deleted correctly"})
    else:
        return jsonify({"error": "error deleting student"}), 400


@app.route("/api/students", methods=["GET"])
def get_all_students():
    collection = db["students"]

    res = list(collection.find())
    if res:
        for doc in res:
            doc["_id"] = str(doc["_id"])
        return jsonify(res)
    else:
        return jsonify([{}])


@app.route("/api/students/<_id>", methods=["GET"])
def get_student_by_id(_id: str):
    collection = db["students"]

    res = collection.find_one({"_id": ObjectId(_id)})

    if res:
        res["_id"] = str(res["_id"])
        return jsonify(res)
    else:
        return jsonify({"error": "error finding students"}), 404


@app.route("/api/students/<_id>", methods=["PATCH"])
def update_student(_id: str):
    collection = db["students"]
    data = request.get_json()

    res = collection.update_one(
        {"_id": ObjectId(_id)},
        {
            "$set": {
                "firstName": data["first"],
                "lastName": data["last"],
                "gpa": 0,
                "major": data["major"],
                "graduatingYear": data["grad"],
            }
        },
    )

    if res.acknowledged:
        return jsonify({"success": "student updated"})
    else:
        return jsonify({"error": "error updating student"}), 500


if __name__ == "__main__":
    app.run()
