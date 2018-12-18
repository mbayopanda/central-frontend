import Form from '../../../lib/presenters/form';
import FormList from '../../../lib/components/form/list.vue';
import testData from '../../data';
import { formatDate } from '../../../lib/util';
import { mockHttp, mockRoute } from '../../http';
import { mockLogin, mockRouteThroughLogin } from '../../session';
import { trigger } from '../../event';

describe('FormList', () => {
  describe('routing', () => {
    it('redirects an anonymous user to login', () =>
      mockRoute('/projects/1')
        .restoreSession(false)
        .afterResponse(app => {
          app.vm.$route.path.should.equal('/login');
        }));

    it('redirects the user back after login', () =>
      mockRouteThroughLogin('/projects/1')
        .respondWithData(() => testData.simpleProjects.createPast(1).last())
        .respondWithData(() => testData.extendedForms.createPast(1).sorted())
        .afterResponse(app => {
          app.vm.$route.path.should.equal('/projects/1');
        }));
  });

  describe('after login', () => {
    beforeEach(mockLogin);

    it('table contains the correct data', () => {
      testData.extendedProjects.createPast(1);
      const forms = testData.extendedForms.createPast(2).sorted();
      // Mocking the route, because FormList uses <router-link>.
      return mockRoute('/projects/1')
        .respondWithData(() => testData.simpleProjects.last())
        .respondWithData(() => forms)
        .afterResponse(page => {
          const tr = page.find('table tbody tr');
          tr.length.should.equal(forms.length);
          for (let i = 0; i < tr.length; i += 1) {
            const td = tr[i].find('td');
            td.length.should.equal(4);
            const form = new Form(forms[i]);

            // First column
            const nameOrId = td[0].first('.form-list-form-name').text().trim();
            nameOrId.should.equal(form.nameOrId());
            if (form.name != null) {
              const xmlFormId = td[0].first('.form-list-form-id').text().trim();
              xmlFormId.should.equal(form.xmlFormId);
            }
            const submissions = td[0].first('.form-list-submissions').text().trim();
            submissions.should.containEql(form.submissions.toLocaleString());

            td[1].text().trim().should.equal(form.createdBy != null
              ? form.createdBy.displayName
              : '');
            td[2].text().trim().should.equal(formatDate(form.updatedOrCreatedAt()));
            td[3].text().trim().should.equal(formatDate(form.lastSubmission));
          }
        });
    });

    it('shows a message if there are no forms', () =>
      mockHttp()
        .mount(FormList)
        .respondWithData(() => [])
        .afterResponse(component => {
          const text = component.first('#form-list-message').text().trim();
          text.should.equal('To get started, add a form.');
        }));

    it('encodes the URL to the form overview page', () =>
      mockRoute('/projects/1')
        .respondWithData(() => testData.simpleProjects.createPast(1).last())
        .respondWithData(() =>
          testData.extendedForms.createPast(1, { xmlFormId: 'a b' }).sorted())
        .afterResponse(app => {
          const href = app.first('.form-list-form-name').getAttribute('href');
          href.should.equal('#/forms/a%20b');
        })
        .request(app => trigger.click(app, '.form-list-form-name'))
        .beforeEachResponse((app, request, index) => {
          if (index === 0) request.url.should.equal('/forms/a%20b');
        })
        .respondWithData(() => testData.extendedForms.last())
        .respondWithData(() => testData.extendedFormAttachments.sorted())
        .respondWithData(() => testData.simpleFieldKeys.sorted())
        .afterResponses(app => {
          app.vm.$route.params.xmlFormId.should.equal('a b');
        }));
  });
});
