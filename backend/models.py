from django.db import models
import json


class AssignmentData(models.Model):
    course_code = models.CharField(max_length=100)
    assignment_id = models.CharField(max_length=100)
    data = models.TextField()  # Storing the serialized result data as text

    class Meta:
        unique_together = ('course_code', 'assignment_id')

    def get_data(self):
        return json.loads(self.data)

    def set_data(self, data):
        self.data = json.dumps(data)
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
