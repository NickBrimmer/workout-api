sleep 2
echo "=========> Inserting Workout Test Data"
mongoimport --host mongodb --db "workouts-database" --collection workouts --file ./workout.json --jsonArray

mongosh mongodb:27017/workouts-database ./create_indices.js