
import { Box, Image } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const images = [
    { src: '/images/ccmc.jpg', top: '5%', right: '5%', size: '300px', delay: 0, duration: 25 },
    { src: '/images/ccnmc.jpg', top: '30%', right: '-5%', size: '350px', delay: 2, duration: 30 },
    { src: '/images/llanocenter.jpg', top: '55%', right: '8%', size: '320px', delay: 4, duration: 28 },
    { src: '/images/peoplemeeting.jpg', top: '80%', right: '0%', size: '380px', delay: 1, duration: 35 },
];

const FloatingImages = () => {
    return (
        <Box
            position="fixed"
            top={0}
            left={0}
            w="100vw"
            h="100vh"
            zIndex={-2}
            pointerEvents="none"
            overflow="hidden"
        >
            {images.map((img, index) => (
                <motion.div
                    key={index}
                    style={{
                        position: 'absolute',
                        top: img.top,
                        right: img.right,
                        width: img.size,
                        opacity: 0.45,
                        filter: 'blur(1.5px) sepia(15%)',
                        maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
                    }}
                    animate={{
                        y: [0, -15, 0, 15, 0],
                        x: [0, 10, -10, 0],
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, -1, 0], // subtle rotation
                    }}
                    transition={{
                        duration: img.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: img.delay,
                    }}
                >
                    <Image
                        src={img.src}
                        w="100%"
                        h="auto"
                        objectFit="cover"
                        alt="Background ambiance"
                    />
                </motion.div>
            ))}
        </Box>
    );
};

export default FloatingImages;
