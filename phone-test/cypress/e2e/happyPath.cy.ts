describe('Happy Path', () => {
  it('Logs in, sees a list of calls and can check a call detail.', () => {
    cy.visit('http://localhost:3000/');

    cy.get('input[data-test-id="username"]').type('username');
    cy.get('input[data-test-id="password"]').type('password{enter}');

    cy.url().should('include', '/calls');
    cy.get('[data-test-id="listedCallBox"]').should('have.length', 5);

    cy.get('[data-test-id="listedCallBox"]').first().click();

    cy.url().should('include', '/calls/');
    cy.get('[data-test-id="callDetailsBox"]').should('exist');
  });
});
