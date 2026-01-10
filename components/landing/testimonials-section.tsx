import { Star, Quote } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "I used to spend 3 hours daily on comments. Now it's 10 minutes reviewing what AI handled. I got my mornings back.",
      author: 'Priya Sharma',
      role: 'Fashion Creator',
      metric: '47 hours saved last month',
      avatar: '/indian-woman-fashion-creator.jpg',
    },
    {
      quote:
        "The AI actually uses my 'lol' and '😭' correctly. My audience thinks I'm just really on top of things now.",
      author: 'Marcus Chen',
      role: 'Tech Reviewer',
      metric: '890 comments/week handled',
      avatar: '/asian-man-tech-youtuber.jpg',
    },
    {
      quote:
        'DM conversions went up 40% because replies happen in seconds, not hours. This paid for itself day one.',
      author: 'Sofia Rodriguez',
      role: 'Course Creator',
      metric: '$12K extra revenue',
      avatar: '/latina-woman-entrepreneur.jpg',
    },
  ];

  return (
    <section className='py-16 sm:py-24 bg-secondary/30'>
      <div className='mx-auto max-w-6xl px-4 sm:px-6'>
        <div className='text-center max-w-2xl mx-auto mb-12'>
          <h2 className='text-2xl sm:text-3xl font-bold tracking-tight'>
            Creators who got their{' '}
            <span className='text-primary'>time back</span>
          </h2>
        </div>

        <div className='grid md:grid-cols-3 gap-6'>
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className='relative rounded-xl border border-border bg-card p-6 flex flex-col'
            >
              <Quote className='w-8 h-8 text-primary/20 mb-4' />

              <blockquote className='text-foreground flex-1'>
                "{testimonial.quote}"
              </blockquote>

              {/* Metric highlight */}
              <div className='my-4 py-3 px-4 rounded-lg bg-success/10 border border-success/20'>
                <p className='text-sm font-semibold text-success'>
                  {testimonial.metric}
                </p>
              </div>

              <div className='flex items-center gap-3 pt-4 border-t border-border'>
                <img
                  src={testimonial.avatar || '/placeholder.svg'}
                  alt={testimonial.author}
                  className='w-10 h-10 rounded-full bg-secondary object-cover'
                />
                <div>
                  <p className='font-medium text-sm'>{testimonial.author}</p>
                  <p className='text-xs text-muted-foreground'>
                    {testimonial.role}
                  </p>
                </div>
                <div className='ml-auto flex gap-0.5'>
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className='w-3 h-3 fill-primary text-primary'
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
