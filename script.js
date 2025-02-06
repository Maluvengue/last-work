document.getElementById('userStatus').addEventListener('change', function () {
    const status = this.value;
    if (status) {
        fetchSurveyQuestions(status);
    } else {
        document.getElementById('questionsContainer').innerHTML = '';
    }
});
function fetchSurveyQuestions(status) {
    const surveyId = status === "Student" ? 1 : 2;
    const surveyUrl = `https://my-json-server.typicode.com/depth0/survey1/surveys/${surveyId}`;

    fetch(surveyUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(survey => {
            console.log("Survey data:", survey);
            const questionContainer = document.getElementById('questionsContainer');
            questionContainer.innerHTML = '';
            const questionPromises = survey.qs.map(qId => {
                return fetch(`https://my-json-server.typicode.com/depth0/survey1/questions/${qId}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Error ${response.status}: ${response.statusText}`);
                        }
                        return response.json();
                    });
            });

            return Promise.all(questionPromises);
        })
        .then(questions => {
            console.log("Questions data:", questions);
            const questionContainer = document.getElementById('questionsContainer');

            questions.forEach(question => {
                const questionElement = document.createElement('div');

                if (question.type === "rate") {
                    questionElement.innerHTML = `
                        <label for="question${question.id}">
                            <strong>${question.title}</strong><br>
                            <em>${question.description}</em>
                        </label>
                        <select id="question${question.id}" name="question${question.id}" required>
                            <option value="">-- Select a rating --</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                    `;
                } else {
                    questionElement.innerHTML = `
                        <label for="question${question.id}">
                            <strong>${question.title}</strong><br>
                            <em>${question.description}</em>
                        </label>
                        <input type="text" id="question${question.id}" name="question${question.id}" required>
                    `;
                }

                questionContainer.appendChild(questionElement);
            });
        })
        .catch(error => {
            console.error('Error fetching survey or questions:', error);
        });
}
document.getElementById('feedbackForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const status = document.getElementById('userStatus').value.trim();
    const comments = document.getElementById('comments').value.trim();

    if (!name || !status || !comments) {
        alert('Please complete all the fields before submitting!');
        return;
    }

    const questionContainer = document.getElementById('questionsContainer');
    const inputs = questionContainer.querySelectorAll('input, select');
    const commentsSection = document.getElementById('commentsSection');

    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');

    let commentContent = `
        <p class="comment-name"><strong>${name}</strong> (Status: ${status})</p>
        <p><strong>Comment:</strong> ${comments}</p>
        <p><strong>Answered Questions:</strong></p>
        <ul>
    `;

    inputs.forEach(input => {
        const labelElement = document.querySelector(`label[for="${input.id}"]`);
        const title = labelElement.querySelector('strong').innerText;
  
        commentContent += `
            <li>
                <strong>${title}:</strong> ${input.value}<br>
            </li>
        `;
    });

    commentContent += '</ul>';

    commentElement.innerHTML = commentContent;
    commentsSection.appendChild(commentElement);

    document.getElementById('feedbackForm').reset();
    questionContainer.innerHTML = '';

    alert('Your comment and answers have been submitted!');
});
