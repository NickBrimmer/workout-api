FROM mongo:8

COPY workout.json /
COPY create_indices.js /
COPY seed_db.sh /

CMD ["sh", "seed_db.sh"]