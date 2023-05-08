from locust import HttpUser, between, task


class WebsiteUser(HttpUser):
    wait_time = between(2, 10)
    
    @task
    def index(self):
        self.client.get('/')
        
    @task(2)
    def editor(self):
        self.client.get('/')
        self.client.get('/ide')

    @task
    def coding_challenge(self):
        self.client.get('/')
        self.client.get('/coding-conundrum')
        
    @task(2)
    def visit_tutorial(self):
        self.client.get('/')
        self.client.get('/tutorials')
        self.client.get('/notebook/1/1')