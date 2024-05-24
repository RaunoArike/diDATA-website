from django.db import models
import json


class AssignmentData(models.Model):
    course_code = models.CharField(max_length=100)
    assignment_id = models.CharField(max_length=100)
    # Using JSONField to store results_by_question and results_by_exercise
    data = models.JSONField(default=dict)

    class Meta:
        unique_together = ('course_code', 'assignment_id')

    def get_data(self, key):
        return self.data.get(key, None)

    def set_data(self, key, value):
        self.data[key] = value
        self.save()


class AssignmentResults(models.Model):
    course_code = models.CharField(max_length=100)
    assignment_id = models.CharField(max_length=100)
    result_ids = models.TextField()  # Storing the serialized list of result IDs

    class Meta:
        unique_together = ('course_code', 'assignment_id')

    def get_result_ids(self):
        return json.loads(self.result_ids)

    def set_result_ids(self, data):
        self.result_ids = json.dumps(data)
        self.save()
