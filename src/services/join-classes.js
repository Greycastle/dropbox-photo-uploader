export default function joinClasses(classes) {
  return classes.filter(c => !!c).join(' ');
}