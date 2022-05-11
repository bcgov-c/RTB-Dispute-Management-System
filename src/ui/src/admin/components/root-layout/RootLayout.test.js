import RootLayout from './RootLayout';

it('renders without crashing', () => {
  const rootLayout = new RootLayout().render();
  expect(rootLayout.$el.html()).toBeTruthy();
});
